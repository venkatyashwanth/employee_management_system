import { Router } from 'express';
import employeeController from '../controllers/employee.controller.js';
import {
  validateEmployeeBody,
  validateEmployeeId,
} from '../middleware/request-validation.middleware.js';

const router = Router();

router.post('/', validateEmployeeBody, employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);
router.get('/:id', validateEmployeeId, employeeController.getEmployeeById);
router.put('/:id', validateEmployeeId, validateEmployeeBody, employeeController.updateEmployee);
router.delete('/:id', validateEmployeeId, employeeController.deleteEmployee);

export default router;
