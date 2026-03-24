import { client } from "../client.ts";

// Get all letters that have been used in this game
export const getUsedLetters = async (roomId: string): Promise<string[]> => {
  return await client.sMembers(`room:${roomId}:usedLetters`);
};
