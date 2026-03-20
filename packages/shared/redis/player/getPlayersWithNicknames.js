const { client } = require("../client");

// Get all players with their nicknames in a room
// Uses pipelining to fetch all nicknames in one batch (N+1 optimization)
const getPlayersWithNicknames = async (roomId) => {
  const playerIds = await client.lRange(`room:${roomId}:players`, 0, -1);

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
  const playersData = playerIds.map((userId, index) => ({
    userId,
    nickname: nicknames[index],
  }));

  return playersData;
};

module.exports = getPlayersWithNicknames;
