import * as Transaction from './transaction.model.js';

async function getSummary(userId) {
  const transactions = await Transaction.findAll(userId);

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'Income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'Expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const balance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate: totalIncome ? Number(((balance / totalIncome) * 100).toFixed(2)) : 0,
  };
}

export { getSummary };
