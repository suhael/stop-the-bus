import { client } from "../client";

// Get all players in order
export const getPlayers = async (roomId: string): Promise<string[]> => {
  return await client.lRange(`room:${roomId}:players`, 0, -1);
};
