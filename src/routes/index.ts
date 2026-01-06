import express from 'express';
import { register, login } from '../controllers/authController';
import {
  createStartingNumber,
  createOperation,
  getCalculationTree
} from '../controllers/calculationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Calculation routes
router.get('/calculations', getCalculationTree);
router.post('/calculations/starting', authenticateToken, createStartingNumber);
router.post('/calculations/operation', authenticateToken, createOperation);

export default router;
