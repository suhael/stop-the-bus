const { client } = require("../client");

// Get all players with their nicknames in a room
const getPlayersWithNicknames = async (roomId) => {
  const playerIds = await client.lRange(`room:${roomId}:players`, 0, -1);
  const playersData = [];

  for (const userId of playerIds) {
    const nickname = await client.hGet(
      `room:${roomId}:player:${userId}`,
      "nickname",
    );
    playersData.push({ userId, nickname });
  }

  return playersData;
};

module.exports = getPlayersWithNicknames;
