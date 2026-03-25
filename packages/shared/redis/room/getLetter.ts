import { client } from "../client.ts";

// Get the current letter for the round
export const getLetter = async (roomId: string): Promise<string | undefined> => {
  return await client.hGet(`room:${roomId}`, "letter");
};
