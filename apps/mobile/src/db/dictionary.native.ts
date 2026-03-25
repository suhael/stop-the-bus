import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'game.db';
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Copies the bundled asset into the SQLite default directory (runs once).
 * This must be awaited in the RootLayout before hiding the Splash Screen.
 */
export const initDatabase = async (): Promise<void> => {
  if (db) return;

  const dbDir = `${FileSystem.documentDirectory}SQLite`;
  const dbPath = `${dbDir}/${DB_NAME}`;

  const dirInfo = await FileSystem.getInfoAsync(dbDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
  }

  const dbInfo = await FileSystem.getInfoAsync(dbPath);
  if (!dbInfo.exists) {
    console.log('[Dictionary] Database not found. Copying game.db from assets...');

    const [{ localUri }] = await Asset.loadAsync(require('../../assets/game.db'));
    if (!localUri) {
      throw new Error('Failed to load game.db asset from bundle.');
    }

    await FileSystem.copyAsync({
      from: localUri,
      to: dbPath,
    });

    console.log('[Dictionary] Database successfully copied!');
  } else {
    console.log('[Dictionary] Database already exists on device.');
  }

  db = await SQLite.openDatabaseAsync(DB_NAME);
};

/**
 * Returns `true` if `word` exists in the dictionary for `category` / `letter`.
 * Returns `true` (fail open) when the DB is not available, avoiding blocking the user.
 */
export const isValidWord = async (
  category: string,
  letter: string,
  word: string,
): Promise<boolean> => {
  if (!word.trim()) return false;

  if (!db) {
    console.warn('[Dictionary] Database not initialized, failing open.');
    return true;
  }

  try {
    const result = await db.getFirstAsync<{ found: number }>(
      'SELECT 1 AS found FROM dictionary WHERE letter = ? AND category = ? AND LOWER(word) = LOWER(?)',
      [letter.toUpperCase(), category, word.trim()],
    );
    return !!result;
  } catch (err) {
    console.warn('[Dictionary] Query error:', err);
    return true;
  }
};