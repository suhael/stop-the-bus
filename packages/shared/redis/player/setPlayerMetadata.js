const { client } = require("../client");

// Store player metadata (nickname, joinedAt, etc.)
const setPlayerMetadata = async (roomId, userId, nickname) => {
  await client.hSet(`room:${roomId}:player:${userId}`, {
    nickname,
    joinedAt: Date.now(),
  });
};

module.exports = setPlayerMetadata;
