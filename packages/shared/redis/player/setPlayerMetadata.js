const { client } = require("../client");

// Store player metadata (nickname, joinedAt, etc.)
const setPlayerMetadata = async (roomId, userId, nickname) => {
  await client.hSet(`room:${roomId}:player:${userId}`, {
    nickname,
    joinedAt: Date.now(),
  });
  // Set same TTL as room (24 hours)
  await client.expire(`room:${roomId}:player:${userId}`, 86400);
};

module.exports = setPlayerMetadata;
