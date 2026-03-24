import { useCallback, useEffect, useRef, useState } from 'react';
import { isValidWord, initDictionary } from '../db/dictionary';

interface ValidationState {
  [category: string]: 'idle' | 'valid' | 'invalid' | 'checking';
}

/**
 * Provides per-category word validation against the bundled SQLite dictionary.
 * Returns a `validate(category, word)` function to call on blur, plus a map of
 * validation states for styling input fields.
 */
export const useValidation = (letter: string) => {
  const [validationState, setValidationState] = useState<ValidationState>({});
  const activeCheckRef = useRef<Record<string, number>>({});

  // Initialise the dictionary in the background (no-op if already loaded)
  useEffect(() => {
    initDictionary();
  }, []);

  const validate = useCallback(
    async (category: string, word: string) => {
      if (!word.trim()) {
        setValidationState((prev) => ({ ...prev, [category]: 'idle' }));
        return;
      }

      // Mark as checking and bump a version counter to discard stale results
      const version = (activeCheckRef.current[category] ?? 0) + 1;
      activeCheckRef.current[category] = version;

      setValidationState((prev) => ({ ...prev, [category]: 'checking' }));

      const valid = await isValidWord(category, letter, word);

      // Ignore if a newer check was started
      if (activeCheckRef.current[category] !== version) return;

      setValidationState((prev) => ({
        ...prev,
        [category]: valid ? 'valid' : 'invalid',
      }));
    },
    [letter],
  );

  const resetValidation = useCallback(() => {
    setValidationState({});
    activeCheckRef.current = {};
  }, []);

  return { validationState, validate, resetValidation };
};
