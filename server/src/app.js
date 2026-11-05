import cors from 'cors';
import express from 'express';
import employeeRoutes from './routes/employee.routes.js';
import healthRoutes from './routes/health.routes.js';
import errorMiddleware from './middleware/error.middleware.js';
import notFoundMiddleware from './middleware/not-found.middleware.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', healthRoutes);
app.use('/api/employees', employeeRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
