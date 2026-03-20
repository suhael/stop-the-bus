/**
 * Calculate scores for all players based on their answers in a round
 *
 * @param {Object} playerAnswers - Object mapping playerId to their category answers
 *   Format: { "userId1": { "Name": "Alice", "Country": "France", ... }, ... }
 * @param {string} speedBonusWinnerId - The userId of the player who clicked STOP
 *
 * @returns {Object} Object mapping playerId to their score
 *   Format: { "userId1": 25, "userId2": 15, ... }
 */
const calculateScores = (playerAnswers, speedBonusWinnerId) => {
  // Initialize result object
  const scores = {};

  // Get all unique words across all players and categories
  // Structure: { "word": [list of playerIds who used it], ... }
  const wordFrequency = {};

  // First pass: build word frequency map
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

      // Normalize word: lowercase and trim for comparison
      const normalizedWord = word.toLowerCase().trim();

      if (!wordFrequency[normalizedWord]) {
        wordFrequency[normalizedWord] = [];
      }

      // Only add if this player hasn't already used this word
      if (!wordFrequency[normalizedWord].includes(playerId)) {
        wordFrequency[normalizedWord].push(playerId);
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
      const playerCount = wordFrequency[normalizedWord].length;

      if (playerCount === 1) {
        // Unique word: 10 points
        playerScore += 10;
      } else if (playerCount > 1) {
        // Shared word: 5 points
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

module.exports = {
  calculateScores,
};
