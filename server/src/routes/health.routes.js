import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is running.' });
});

router.get('/health/db', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Unable to connect to the database.',
    });
  }
});

export default router;
