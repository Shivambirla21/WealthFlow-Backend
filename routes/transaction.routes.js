import express from 'express';
import * as transactionController from '../controllers/transaction.controller.js';

const router = express.Router();

router.get('/', transactionController.listTransactions);
router.post('/', transactionController.createTransaction);

export default router;
