import { client } from "../client.ts";

// Get all player answers for a specific round in a room
// Returns: { userId: answersObj, ... }
export const getRoomAnswers = async (
  roomId: string,
  round: string | number
): Promise<Record<string, Record<string, string> | null>> => {
  const key = `room:${roomId}:answers:${round}`;
  const raw = await client.hGetAll(key);
  const parsed: Record<string, Record<string, string> | null> = {};
  for (const [userId, json] of Object.entries(raw)) {
    try {
      parsed[userId] = JSON.parse(json as string);
    } catch {
      parsed[userId] = null;
    }
  }
  return parsed;
};
