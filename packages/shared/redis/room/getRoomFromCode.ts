import { client } from "../client.ts";

// Look up roomId from a room code
export const getRoomFromCode = async (roomCode: string): Promise<string | null> => {
  return await client.get(`code:${roomCode}`);
};
