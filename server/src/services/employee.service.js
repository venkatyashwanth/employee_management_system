import employeeModel from '../models/employee.model.js';

const employeeFields = new Set([
  'employee_code',
  'first_name',
  'last_name',
  'email',
  'phone',
  'job_title',
  'department_id',
  'date_of_joining',
  'employment_status',
]);

const requiredFields = ['employee_code', 'first_name', 'last_name', 'email'];
const textFieldLimits = {
  employee_code: 30,
  first_name: 100,
  last_name: 100,
  email: 150,
  phone: 20,
  job_title: 100,
};

const createError = (status, message, code) => {
  const error = new Error(message);
  error.status = status;
  if (code) error.code = code;
  return error;
};

const normalizeEmployeeData = (employeeData) => {
  if (
    employeeData === null
    || typeof employeeData !== 'object'
    || Array.isArray(employeeData)
  ) {
    throw createError(400, 'Request body must be a JSON object.');
  }

  const unknownFields = Object.keys(employeeData).filter((field) => !employeeFields.has(field));
  if (unknownFields.length > 0) {
    throw createError(400, 'Request contains unsupported employee fields.');
  }

  const normalized = {};

  for (const field of requiredFields) {
    const value = employeeData[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw createError(400, `${field} is required and must be a non-empty string.`);
    }

    normalized[field] = field === 'email'
      ? value.trim().toLowerCase()
      : value.trim();
  }

  for (const [field, maxLength] of Object.entries(textFieldLimits)) {
    if (requiredFields.includes(field)) {
      if (normalized[field].length > maxLength) {
        throw createError(400, `${field} must be ${maxLength} characters or fewer.`);
      }
      continue;
    }

    const value = employeeData[field];
    if (value === undefined || value === null) {
      normalized[field] = null;
      continue;
    }

    if (typeof value !== 'string') {
      throw createError(400, `${field} must be a string or null.`);
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > maxLength) {
      throw createError(400, `${field} must be ${maxLength} characters or fewer.`);
    }
    normalized[field] = trimmedValue || null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    throw createError(400, 'email must be a valid email address.');
  }

  const departmentId = employeeData.department_id;
  if (departmentId === undefined || departmentId === null) {
    normalized.department_id = null;
  } else if (
    !Number.isSafeInteger(departmentId)
    || departmentId < 1
    || departmentId > 2147483647
  ) {
    throw createError(400, 'department_id must be a positive integer or null.');
  } else {
    normalized.department_id = departmentId;
  }

  const dateOfJoining = employeeData.date_of_joining;
  const parsedDate = typeof dateOfJoining === 'string'
    ? new Date(`${dateOfJoining}T00:00:00.000Z`)
    : null;
  if (dateOfJoining === undefined || dateOfJoining === null) {
    normalized.date_of_joining = null;
  } else if (
    typeof dateOfJoining !== 'string'
    || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfJoining)
    || dateOfJoining < '1000-01-01'
    || Number.isNaN(parsedDate.getTime())
    || parsedDate.toISOString().slice(0, 10) !== dateOfJoining
  ) {
    throw createError(400, 'date_of_joining must be a valid date in YYYY-MM-DD format.');
  } else {
    normalized.date_of_joining = dateOfJoining;
  }

  const employmentStatus = employeeData.employment_status === undefined
    ? 'ACTIVE'
    : employeeData.employment_status;
  if (!['ACTIVE', 'INACTIVE'].includes(employmentStatus)) {
    throw createError(400, 'employment_status must be ACTIVE or INACTIVE.');
  }
  normalized.employment_status = employmentStatus;

  return normalized;
};

const validateId = (id) => {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    throw createError(400, 'Employee id must be a positive integer.');
  }
  return Number(id);
};

const rethrowDatabaseError = (error) => {
  if (error.code === 'ER_DUP_ENTRY') {
    const databaseMessage = String(error.sqlMessage || error.message).toLowerCase();
    if (databaseMessage.includes('employee_code')) {
      throw createError(409, 'An employee with this employee_code already exists.');
    }
    if (databaseMessage.includes('email')) {
      throw createError(409, 'An employee with this email already exists.');
    }
    throw createError(409, 'An employee with this employee_code or email already exists.');
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
    throw createError(400, 'department_id does not reference an existing department.');
  }

  throw error;
};

const withDatabaseErrorHandling = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    rethrowDatabaseError(error);
  }
};

const getEmployeeOrThrow = async (id) => {
  const employee = await employeeModel.getEmployeeById(id);
  if (!employee) {
    throw createError(404, 'Employee not found.', 'EMPLOYEE_NOT_FOUND');
  }
  return employee;
};

const createEmployee = async (employeeData) => (
  withDatabaseErrorHandling(async () => (
    employeeModel.createEmployee(normalizeEmployeeData(employeeData))
  ))
);

const getAllEmployees = async () => employeeModel.getAllEmployees();

const getEmployeeById = async (id) => getEmployeeOrThrow(validateId(id));

const updateEmployee = async (id, employeeData) => {
  const employeeId = validateId(id);
  const normalizedData = normalizeEmployeeData(employeeData);

  return withDatabaseErrorHandling(async () => {
    await getEmployeeOrThrow(employeeId);
    const employee = await employeeModel.updateEmployee(employeeId, normalizedData);
    if (!employee) {
      throw createError(404, 'Employee not found.', 'EMPLOYEE_NOT_FOUND');
    }
    return employee;
  });
};

const deleteEmployee = async (id) => {
  const employeeId = validateId(id);

  return withDatabaseErrorHandling(async () => {
    await getEmployeeOrThrow(employeeId);
    const deleted = await employeeModel.deleteEmployee(employeeId);
    if (!deleted) {
      throw createError(404, 'Employee not found.', 'EMPLOYEE_NOT_FOUND');
    }
  });
};

export default {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
