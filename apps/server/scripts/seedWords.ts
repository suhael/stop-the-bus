import path from 'path';
import Database from 'better-sqlite3';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../../../data/game.db');
const csvPath = process.env.WORDS_CSV_PATH || path.join(__dirname, '../../../data/words.csv');

const db = new Database(dbPath);

const seedWords = (words?: any[]) => {
  // Reset the table to have a clean seed if needed, or just insert. 
  // Let's drop it first to avoid duplicate seeds if run multiple times.
  db.prepare('DROP TABLE IF EXISTS dictionary').run();
  db.prepare('CREATE TABLE IF NOT EXISTS dictionary (letter TEXT, category TEXT, word TEXT)').run();
  
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const records: any[] = words ?? parse(csvData, { columns: true });

  const insert = db.prepare('INSERT INTO dictionary (letter, category, word) VALUES (?, ?, ?)');
  
  // Use a transaction for high-performance seeding
  const insertMany = db.transaction((rows: any[]) => {
    for (const row of rows) {
      if (row.letter && row.category && row.word) {
        insert.run(row.letter.trim(), row.category.trim(), row.word.trim().toLowerCase());
      }
    }
  });

  insertMany(records);
  console.log(`✅ Seeded ${records.length} words into SQLite.`);
};

export default seedWords;
