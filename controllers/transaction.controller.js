import * as Transaction from '../models/transaction.model.js';

function listTransactions(req, res) {
  res.json({ success: true, data: Transaction.findAll() });
}

function createTransaction(req, res) {
  const transaction = Transaction.create(req.body);
  res.status(201).json({ success: true, data: transaction });
}

export { listTransactions, createTransaction };
