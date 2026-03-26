import { useCallback, useEffect, useRef, useState } from 'react';
import { isValidWord } from '@/src/db/dictionary';

interface ValidationState {
  [category: string]: 'idle' | 'valid' | 'invalid' | 'checking';
}

interface ValidationErrors {
  [category: string]: string;
}

const DEBOUNCE_MS = 150;

/**
 * Provides per-category word validation against the bundled SQLite dictionary.
 * Returns a `validate(category, word)` function to call on blur, plus a map of
 * validation states for styling input fields.
 *
 * Validation calls are debounced per-category (150 ms) so that rapid focus
 * changes between inputs (e.g. tapping through all five fields quickly) don't
 * queue up multiple simultaneous SQLite reads on the UI thread.
 */
export const useValidation = (letter: string) => {
  const [validationState, setValidationState] = useState<ValidationState>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const activeCheckRef = useRef<Record<string, number>>({});
  const debounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // No need to initialise the DB here — _layout.tsx guarantees initDatabase()
  // completes (and the app gates behind an error screen if it fails) before
  // any screen — and therefore this hook — can ever be mounted.

  const validate = useCallback(
    (category: string, word: string) => {

      console.log(`Validating category "${category}" with word "${word}" against letter "${letter}"`);

      // Cancel any pending debounced call for this category
      if (debounceTimersRef.current[category] !== undefined) {
        clearTimeout(debounceTimersRef.current[category]);
      }

      if (!word.trim()) {
        setValidationState((prev) => ({ ...prev, [category]: 'idle' }));
        return;
      }

      // Letter-start check: fast, synchronous, no need to hit the DB
      if (!word.trim().toLowerCase().startsWith(letter.toLowerCase())) {
        setValidationState((prev) => ({ ...prev, [category]: 'invalid' }));
        setValidationErrors((prev) => ({
          ...prev,
          [category]: `Word must start with '${letter.toUpperCase()}'`,
        }));
        return;
      }

      // Show "checking" immediately so the UI feels responsive
      setValidationState((prev) => ({ ...prev, [category]: 'checking' }));

      debounceTimersRef.current[category] = setTimeout(async () => {
        // Bump a version counter to discard results from stale in-flight checks
        const version = (activeCheckRef.current[category] ?? 0) + 1;
        activeCheckRef.current[category] = version;

        const valid = await isValidWord(category, letter, word);

        if (activeCheckRef.current[category] !== version) return;

        setValidationErrors((prev) => ({
          ...prev,
          [category]: valid ? '' : 'Not found in dictionary — still counts if teammates agree!',
        }));
        setValidationState((prev) => ({
          ...prev,
          [category]: valid ? 'valid' : 'invalid',
        }));
      }, DEBOUNCE_MS);
    },
    [letter],
  );

  const resetValidation = useCallback(() => {
    // Flush all pending timers before clearing state
    Object.values(debounceTimersRef.current).forEach(clearTimeout);
    debounceTimersRef.current = {};
    setValidationState({});
    setValidationErrors({});
    activeCheckRef.current = {};
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  return { validationState, validationErrors, validate, resetValidation };
};
