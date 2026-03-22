import path from 'path';
let db: any;
let cachedCategories: string[] | null = null;

try {
  // Use environment variable for production, fallback to local path for development
  const dbPath = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../../data/game.db');
  db = require('better-sqlite3')(dbPath, { readonly: true });
} catch (err: any) {
  console.warn("⚠️ Could not load better-sqlite3 in dictionary.ts", err.message);
}

// Database validation helper
export const isValidWord = (category: string, letter: string, word: string): boolean => {
  if (!db) return true; // Fallback if DB isn't available
  try {
    // Using LOWER(word) to ensure bulletproof case-insensitivity on both sides
    const stmt = db.prepare('SELECT 1 FROM dictionary WHERE letter = ? AND category = ? AND LOWER(word) = LOWER(?)');
    // Using upper initial letter as seeded in CSV (e.g., 'A', 'B')
    const result = stmt.get(letter.toUpperCase(), category, word);
    return !!result;
  } catch (err) {
    console.error("DB Validation error:", err);
    return true; // Fallback to accept word if DB errors occur
  }
};

// Fetch categories from SQLite (cached in memory)
export const getCategories = (): string[] => {
  if (cachedCategories) {
    return cachedCategories;
  }
  if (!db) {
    // If DB fails, fallback to hardcoded default categories to prevent crashes
    return ["Name", "Country", "Food", "Animal", "Brand"];
  }
  try {
    const stmt = db.prepare('SELECT DISTINCT category FROM dictionary');
    const rows: { category: string }[] = stmt.all();
    cachedCategories = rows.map(r => r.category);
    return cachedCategories;
  } catch (err) {
    console.error("DB Get Categories error:", err);
    return ["Name", "Country", "Food", "Animal", "Brand"];
  }
};
