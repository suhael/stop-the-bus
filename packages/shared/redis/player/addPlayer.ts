import { client } from "../client";

// Add a player to a room
export const addPlayer = async (roomId: string, playerId: string): Promise<void> => {
  await client.rPush(`room:${roomId}:players`, playerId);
};
