import { client } from "../client.ts";

// Get room status
export const getRoomStatus = async (roomId: string): Promise<string | undefined> => {
  return await client.hGet(`room:${roomId}`, "status");
};
