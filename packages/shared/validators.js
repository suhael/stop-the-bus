/**
 * Input validators for Stop the Bus game
 */

const validateUserId = (userId) => {
  if (!userId || typeof userId !== "string") {
    return { valid: false, error: "userId must be a non-empty string" };
  }
  if (userId.trim().length === 0) {
    return { valid: false, error: "userId cannot be empty" };
  }
  if (userId.length > 100) {
    return { valid: false, error: "userId too long (max 100 chars)" };
  }
  return { valid: true };
};

const validateNickname = (nickname) => {
  if (!nickname || typeof nickname !== "string") {
    return { valid: false, error: "nickname must be a non-empty string" };
  }
  if (nickname.trim().length === 0) {
    return { valid: false, error: "nickname cannot be empty" };
  }
  if (nickname.length > 50) {
    return { valid: false, error: "nickname too long (max 50 chars)" };
  }
  // Prevent XSS with basic check
  if (/<[^>]*>/.test(nickname)) {
    return { valid: false, error: "nickname contains invalid characters" };
  }
  return { valid: true };
};

const validateRoomCode = (roomCode) => {
  if (!roomCode || typeof roomCode !== "string") {
    return { valid: false, error: "roomCode must be a non-empty string" };
  }
  if (!/^\d{5}$/.test(roomCode)) {
    return { valid: false, error: "roomCode must be exactly 5 digits" };
  }
  return { valid: true };
};

module.exports = {
  validateUserId,
  validateNickname,
  validateRoomCode,
};
