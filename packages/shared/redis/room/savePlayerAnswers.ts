
import { client } from "../client";

// Save a player's answers for a specific round in a room
export const savePlayerAnswers = async (
  roomId: string,
  round: number,
  userId: string,
  answers: Record<string, unknown>
): Promise<void> => {
  const key = `room:${roomId}:answers:${round}`;
  await client.hSet(key, userId, JSON.stringify(answers));
  // Set expiry for safety (24h)
  await client.expire(key, 60 * 60 * 24);
};
