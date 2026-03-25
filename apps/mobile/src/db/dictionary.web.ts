/**
 * Web/static export fallback.
 * The native app uses SQLite-backed validation, but Expo static web export
 * pulls in expo-sqlite's wasm worker, which breaks CI in this project setup.
 * For web builds we fail open and skip DB initialisation.
 */
export const initDatabase = async (): Promise<void> => {
  return;
};

export const isValidWord = async (
  _category: string,
  _letter: string,
  word: string,
): Promise<boolean> => {
  return word.trim().length > 0;
};