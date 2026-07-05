import express from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import { requireAuth } from '../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', transactionController.listTransactions);
router.post('/', transactionController.createTransaction);

export default router;
