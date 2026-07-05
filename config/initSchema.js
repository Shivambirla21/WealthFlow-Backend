import { query } from './database.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = await readFile(schemaPath, 'utf8');
  const statements = schemaSql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await query(statement);
  }

  console.log('Database schema initialized');
}

export { initializeSchema };
