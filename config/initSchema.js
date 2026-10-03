import { query } from './database.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = await readFile(schemaPath, 'utf8');
  
  // Split by semicolons, but preserve DO $$ blocks
  const statements = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarQuoteTag = '';
  
  for (let i = 0; i < schemaSql.length; i++) {
    const char = schemaSql[i];
    const nextChar = schemaSql[i + 1] || '';
    
    // Check for dollar quote start
    if (!inDollarQuote && char === '$' && nextChar === '$') {
      // Find the tag
      let tagEnd = i + 2;
      while (tagEnd < schemaSql.length && schemaSql[tagEnd] !== '$') {
        tagEnd++;
      }
      const tag = schemaSql.slice(i + 2, tagEnd);
      if (schemaSql[tagEnd] === '$' && schemaSql[tagEnd + 1] === '$') {
        inDollarQuote = true;
        dollarQuoteTag = tag;
        currentStatement += schemaSql.slice(i, tagEnd + 2);
        i = tagEnd + 1;
        continue;
      }
    }
    
    // Check for dollar quote end
    if (inDollarQuote && char === '$' && nextChar === '$') {
      let tagEnd = i + 2;
      while (tagEnd < schemaSql.length && schemaSql[tagEnd] !== '$') {
        tagEnd++;
      }
      const tag = schemaSql.slice(i + 2, tagEnd);
      if (tag === dollarQuoteTag && schemaSql[tagEnd] === '$' && schemaSql[tagEnd + 1] === '$') {
        inDollarQuote = false;
        currentStatement += schemaSql.slice(i, tagEnd + 2);
        i = tagEnd + 1;
        continue;
      }
    }
    
    // Split by semicolon when not in dollar quote
    if (!inDollarQuote && char === ';') {
      const statement = currentStatement.trim();
      if (statement) {
        statements.push(statement);
      }
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }
  
  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  for (const statement of statements) {
    await query(statement);
  }

  console.log('Database schema initialized');
}

export { initializeSchema };
