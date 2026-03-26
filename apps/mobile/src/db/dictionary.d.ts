// Type stub for platform-specific implementations:
//   dictionary.native.ts  — full SQLite implementation (iOS / Android)
//   dictionary.web.ts     — no-op stub (web / static export)
//
// TypeScript resolves this file for type-checking; Metro resolves the
// platform-specific file at bundle time.

export declare function initDatabase(): Promise<void>;
export declare function isValidWord(category: string, letter: string, word: string): Promise<boolean>;
