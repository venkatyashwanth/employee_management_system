import employeeService from '../services/employee.service.js';

const validateEmployeeId = (req, _res, next) => {
  try {
    employeeService.validateEmployeeId(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
};

const validateEmployeeBody = (req, _res, next) => {
  try {
    req.body = employeeService.validateEmployeeData(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export {
  validateEmployeeBody,
  validateEmployeeId,
};
