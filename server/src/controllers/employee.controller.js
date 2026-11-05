import employeeService from '../services/employee.service.js';

const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully.',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const getAllEmployees = async (_req, res, next) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.status(200).json({
      status: 'success',
      message: 'Employees retrieved successfully.',
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Employee retrieved successfully.',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Employee updated successfully.',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Employee deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
