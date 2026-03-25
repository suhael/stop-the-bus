import { client } from "../client";

// Get current host (The Driver)
export const getHost = async (roomId: string): Promise<string | undefined> => {
  return await client.hGet(`room:${roomId}`, "host_id");
};
