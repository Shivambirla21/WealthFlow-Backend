const transactions = [];

function findAll() {
  return transactions;
}

function create(payload) {
  const transaction = {
    id: Date.now().toString(),
    type: payload.type,
    amount: Number(payload.amount || 0),
    category: payload.category || 'General',
    note: payload.note || '',
    date: payload.date || new Date().toISOString(),
  };

  transactions.push(transaction);
  return transaction;
}

export { findAll, create };
