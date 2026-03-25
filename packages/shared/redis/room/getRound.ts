import { client } from "../client";

// Get the current round number for a room
export const getRound = async (roomId: string): Promise<string | undefined> => {
  return await client.hGet(`room:${roomId}`, "round");
};
