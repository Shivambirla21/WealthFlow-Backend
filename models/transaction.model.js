import { query } from '../config/database.js';
import { ensureDefaultUser } from './user.model.js';

async function findAll() {
  const result = await query('SELECT * FROM transactions ORDER BY created_at DESC');
  return result.rows;
}

async function create(payload) {
  const user = await ensureDefaultUser();
  const type = payload.kind === 'expense' ? 'Expense' : 'Income';
  const amount = Number(payload.amount ?? payload.amt ?? 0);
  const title = payload.title || payload.name || `${type} entry`;
  const category = payload.category || payload.type || 'other';
  const notes = payload.notes || '';
  const date = payload.date || new Date().toISOString().slice(0, 10);
  const accountId = payload.accountId ? Number(payload.accountId) : null;
  const frequency = payload.frequency || payload.freq || 'one-time';
  const perSecond = Number(payload.perSecond ?? payload.ps ?? 0);
  const isRecurring = Boolean(payload.isRecurring ?? payload.recurring ?? false);

  const transactionResult = await query(
    `INSERT INTO transactions (user_id, account_id, type, category, title, amount, date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user.id, accountId, type, category, title, amount, date, notes],
  );

  const tableName = type === 'Expense' ? 'expenses' : 'income';
  const tableResult = await query(
    `INSERT INTO ${tableName} (user_id, account_id, name, category, amount, frequency, per_second, is_recurring)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [user.id, accountId, title, category, amount, frequency, perSecond, isRecurring],
  );

  return {
    ...transactionResult.rows[0],
    tableEntry: tableResult.rows[0],
    kind: type === 'Expense' ? 'expense' : 'income',
  };
}

export { findAll, create };
