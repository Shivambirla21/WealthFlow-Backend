import 'dotenv/config';
import { query } from './config/database.js';

const sql = "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('users','accounts','income','expenses','transactions','budgets','goals','assets','liabilities','investments','notifications','settings') ORDER BY table_name";
const result = await query(sql);
console.log(JSON.stringify(result.rows));
