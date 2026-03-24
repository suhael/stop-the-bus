import { client } from "../client.ts";

// Add a letter to the used letters set for this game
export const addUsedLetter = async (roomId: string, letter: string): Promise<void> => {
  await client.sAdd(`room:${roomId}:usedLetters`, letter);
  // Set same TTL as room (24 hours)
  await client.expire(`room:${roomId}:usedLetters`, 86400);
};
