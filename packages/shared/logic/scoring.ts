
import { isValidWord } from "./dictionary";

export interface PlayerAnswers {
  [playerId: string]: {
    [category: string]: string | null;
  } | null | undefined;
}

export const calculateScores = (
  playerAnswers: PlayerAnswers,
  letter: string,
  speedBonusWinnerId: string
): { [playerId: string]: number } => {
  // Initialize result object
  const scores: { [playerId: string]: number } = {};
  // Word frequency tracking - NESTED BY CATEGORY for accurate uniqueness
  // Structure: { "Name": { "alice": [playerIds], ... }, ... }
  const wordFrequencyByCategory: {
    [category: string]: {
      [normalizedWord: string]: string[];
    };
  } = {};

  // First pass: build per-category word frequency map (uniqueness only within each category)
  for (const [playerId, answers] of Object.entries(playerAnswers)) {
    if (!answers || typeof answers !== "object") {
      scores[playerId] = 0;
      continue;
    }
    for (const [category, word] of Object.entries(answers)) {
      // Skip empty or null words
      if (!word || typeof word !== "string" || word.trim().length === 0) {
        continue;
      }
      // LETTER VALIDATION: Check word starts with the correct letter (case-insensitive)
      const normalizedWord = word.toLowerCase().trim();
      if (!normalizedWord.startsWith(letter.toLowerCase())) {
        continue;
      }
      // SERVER DICTIONARY VALIDATION (Cross-reference)
      if (!isValidWord(category, letter, normalizedWord)) {
        continue;
      }
      // Initialize category map if needed
      if (!wordFrequencyByCategory[category]) {
        wordFrequencyByCategory[category] = {};
      }
      // Track player for this word in this category only
      if (!wordFrequencyByCategory[category][normalizedWord]) {
        wordFrequencyByCategory[category][normalizedWord] = [];
      }
      if (
        !wordFrequencyByCategory[category][normalizedWord].includes(playerId)
      ) {
        wordFrequencyByCategory[category][normalizedWord].push(playerId);
      }
    }
  }

  // Second pass: calculate scores for each player
  for (const [playerId, answers] of Object.entries(playerAnswers)) {
    let playerScore = 0;
    if (!answers || typeof answers !== "object") {
      scores[playerId] = 0;
      continue;
    }
    for (const [category, word] of Object.entries(answers)) {
      // Skip empty or null words
      if (!word || typeof word !== "string" || word.trim().length === 0) {
        continue;
      }
      const normalizedWord = word.toLowerCase().trim();
      // LETTER VALIDATION: Skip if doesn't start with correct letter
      if (!normalizedWord.startsWith(letter.toLowerCase())) {
        continue;
      }
      // SERVER DICTIONARY VALIDATION (Cross-reference)
      if (!isValidWord(category, letter, normalizedWord)) {
        continue;
      }
      // Get category frequency map
      if (!wordFrequencyByCategory[category]) {
        continue;
      }
      const playerCount =
        wordFrequencyByCategory[category][normalizedWord]?.length || 0;
      if (playerCount === 1) {
        // Unique word in this category: 10 points
        playerScore += 10;
      } else if (playerCount > 1) {
        // Shared word in this category: 5 points
        playerScore += 5;
      }
    }
    // Apply speed bonus if this player clicked STOP
    if (playerId === speedBonusWinnerId) {
      playerScore += 3;
    }
    scores[playerId] = playerScore;
  }

  return scores;
};

