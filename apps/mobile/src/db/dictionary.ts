/**
 * SQLite Dictionary Module
 *
 * Copies the bundled `words.db` asset into the device's default SQLite
 * directory on first launch, then exposes `isValidWord()` for instant on-blur
 * input validation with zero network latency.
 *
 * Uses the expo-file-system v19 OOP API (File / Directory / Paths) and
 * expo-sqlite v16 (`openDatabaseAsync` with optional directory parameter).
 *
 * Fails open — if the DB is unavailable all words are treated as valid so
 * gameplay is never blocked.
 *
 * Schema (mirrors the server's game.db):
 *   CREATE TABLE dictionary (letter TEXT, category TEXT, word TEXT);
 *   CREATE INDEX idx ON dictionary(letter, category, word);
 *
 * To build words.db, run the server seed script and copy the resulting
 * game.db to apps/mobile/assets/words.db.
 */

import { openDatabaseAsync, defaultDatabaseDirectory, type SQLiteDatabase } from 'expo-sqlite';
import { Directory, File, Paths } from 'expo-file-system';

const DB_NAME = 'words.db';

let db: SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

/** Copy the bundled asset into the SQLite default directory (runs once). */
const ensureDatabase = async (): Promise<void> => {
  if (db) return;

  // The asset may not exist yet during early development — fail gracefully.
  let dbAssetModule: number | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    dbAssetModule = require('../../assets/words.db') as number;
  } catch {
    console.warn('[Dictionary] words.db asset not found — validation disabled.');
    return;
  }

  try {
    const { Asset } = await import('expo-asset');

    // Ensure the default SQLite directory exists
    const sqliteDir = new Directory(defaultDatabaseDirectory);
    if (!sqliteDir.exists) {
      sqliteDir.create();
    }

    // Only copy the asset if the DB file isn't already in place
    const destFile = new File(Paths.document, 'SQLite', DB_NAME);
    if (!destFile.exists) {
      const asset = await Asset.fromModule(dbAssetModule).downloadAsync();
      if (asset.localUri) {
        const srcFile = new File(asset.localUri);
        srcFile.copy(sqliteDir);
      }
    }

    // Open without passing a directory — expo-sqlite v16 defaults to
    // defaultDatabaseDirectory which is the same folder we copied into.
    db = await openDatabaseAsync(DB_NAME);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Dictionary] Failed to initialise SQLite dictionary:', msg);
  }
};

/** Initialise the DB once (lazy, cached). */
export const initDictionary = (): Promise<void> => {
  if (!initPromise) {
    initPromise = ensureDatabase().catch((err) => {
      console.warn('[Dictionary] Could not load words.db:', err?.message);
      initPromise = null; // allow retry
    });
  }
  return initPromise;
};

/**
 * Returns `true` if `word` exists in the dictionary for `category` / `letter`.
 * Returns `true` (pass-through) when the DB is not available.
 */
export const isValidWord = async (
  category: string,
  letter: string,
  word: string,
): Promise<boolean> => {
  if (!word.trim()) return false;
  if (!db) return true; // fail open

  try {
    const result = await db.getFirstAsync<{ found: number }>(
      'SELECT 1 AS found FROM dictionary WHERE letter = ? AND category = ? AND LOWER(word) = LOWER(?)',
      [letter.toUpperCase(), category, word.trim()],
    );
    return !!result;
  } catch (err) {
    console.warn('[Dictionary] Query error:', err);
    return true; // fail open
  }
};

/** Returns `true` if the dictionary DB has been successfully loaded. */
export const isDictionaryReady = (): boolean => !!db;
