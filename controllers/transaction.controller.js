import * as Transaction from '../models/transaction.model.js';

async function listTransactions(req, res) {
  try {
    const data = await Transaction.findAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function createTransaction(req, res) {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export { listTransactions, createTransaction };
