import { client } from "../client";

export interface PlayerWithNickname {
  userId: string;
  nickname: string | null;
}

// Get all players with their nicknames in a room
// Uses pipelining to fetch all nicknames in one batch (N+1 optimization)
export const getPlayersWithNicknames = async (roomId: string): Promise<PlayerWithNickname[]> => {
  const playerIds: string[] = await client.lRange(`room:${roomId}:players`, 0, -1);

  if (playerIds.length === 0) {
    return [];
  }

  // Use pipelining to fetch all nicknames in one batch request
  const pipeline = client.multi();
  for (const userId of playerIds) {
    pipeline.hGet(`room:${roomId}:player:${userId}`, "nickname");
  }
  const nicknames = await pipeline.exec();

  // Map results back to playerIds
  const playersData: PlayerWithNickname[] = playerIds.map((userId: string, index: number) => ({
    userId,
    nickname: nicknames[index] as string | null,
  }));

  return playersData;
};
