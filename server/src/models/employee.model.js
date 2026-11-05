import pool from '../config/db.js';

const employeeSelect = `
  SELECT
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.phone,
    e.job_title,
    e.department_id,
    DATE_FORMAT(e.date_of_joining, '%Y-%m-%d') AS date_of_joining,
    e.employment_status,
    e.created_at,
    e.updated_at,
    d.name AS department_name
  FROM employees AS e
  LEFT JOIN departments AS d ON d.id = e.department_id
`;

const createEmployee = async (employeeData) => {
  const [result] = await pool.execute(
    `INSERT INTO employees (
      employee_code,
      first_name,
      last_name,
      email,
      phone,
      job_title,
      department_id,
      date_of_joining,
      employment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      employeeData.employee_code,
      employeeData.first_name,
      employeeData.last_name,
      employeeData.email,
      employeeData.phone,
      employeeData.job_title,
      employeeData.department_id,
      employeeData.date_of_joining,
      employeeData.employment_status,
    ],
  );

  return getEmployeeById(result.insertId);
};

const getAllEmployees = async () => {
  const [rows] = await pool.execute(`${employeeSelect} ORDER BY e.id`);
  return rows;
};

const getEmployeeById = async (id) => {
  const [rows] = await pool.execute(`${employeeSelect} WHERE e.id = ?`, [id]);
  return rows[0] ?? null;
};

const updateEmployee = async (id, employeeData) => {
  await pool.execute(
    `UPDATE employees
    SET employee_code = ?,
        first_name = ?,
        last_name = ?,
        email = ?,
        phone = ?,
        job_title = ?,
        department_id = ?,
        date_of_joining = ?,
        employment_status = ?
    WHERE id = ?`,
    [
      employeeData.employee_code,
      employeeData.first_name,
      employeeData.last_name,
      employeeData.email,
      employeeData.phone,
      employeeData.job_title,
      employeeData.department_id,
      employeeData.date_of_joining,
      employeeData.employment_status,
      id,
    ],
  );

  return getEmployeeById(id);
};

const deleteEmployee = async (id) => {
  const [result] = await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

export default {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
