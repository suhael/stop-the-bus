/**
 * Input validators for Stop the Bus game
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

export const validateUserId = (userId: unknown): ValidationResult => {
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

export const validateNickname = (nickname: unknown): ValidationResult => {
  if (!nickname || typeof nickname !== "string") {
    return { valid: false, error: "nickname must be a non-empty string" };
  }
  if (nickname.trim().length === 0) {
    return { valid: false, error: "nickname cannot be empty" };
  }
  if (nickname.length > 50) {
    return { valid: false, error: "nickname too long (max 50 chars)" };
  }
  // Strip all non-alphanumeric characters for safety (XSS prevention)
  const sanitized = nickname.replace(/[^a-zA-Z0-9]/g, "");
  if (sanitized.length === 0) {
    return {
      valid: false,
      error: "nickname must contain at least one letter or number",
    };
  }
  return { valid: true, sanitized };
};

export const validateRoomCode = (roomCode: unknown): ValidationResult => {
  if (!roomCode || typeof roomCode !== "string") {
    return { valid: false, error: "roomCode must be a non-empty string" };
  }
  if (!/^[A-Z0-9]{5}$/i.test(roomCode)) {
    return {
      valid: false,
      error: "roomCode must be exactly 5 alphanumeric characters",
    };
  }
  return { valid: true };
};
