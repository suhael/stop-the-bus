import { client } from "../client";

// Store player metadata (nickname, joinedAt, etc.)
export const setPlayerMetadata = async (roomId: string, userId: string, nickname: string): Promise<void> => {
  await client.hSet(`room:${roomId}:player:${userId}`, {
    nickname,
    joinedAt: Date.now(),
  });
  // Set same TTL as room (24 hours)
  await client.expire(`room:${roomId}:player:${userId}`, 86400);
};
