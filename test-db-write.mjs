import 'dotenv/config';
import { connectDatabase, query } from './config/database.js';

const status = await connectDatabase();
console.log(JSON.stringify(status));

if (status.connected) {
  await query('CREATE TABLE IF NOT EXISTS demo_test (id SERIAL PRIMARY KEY, label TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
  const insertRes = await query('INSERT INTO demo_test(label) VALUES($1) RETURNING id, label, created_at', ['demo-from-assistant']);
  console.log(JSON.stringify({ inserted: insertRes.rows[0] }));
  const selectRes = await query('SELECT * FROM demo_test ORDER BY id DESC LIMIT 1');
  console.log(JSON.stringify({ latest: selectRes.rows[0] }));
}
