import * as Transaction from './transaction.model.js';

function getSummary() {
  const transactions = Transaction.findAll();

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate: totalIncome ? Number(((balance / totalIncome) * 100).toFixed(2)) : 0,
  };
}

export { getSummary };
