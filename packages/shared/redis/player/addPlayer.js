const { client } = require("../client");

// Add a player to a room
const addPlayer = async (roomId, playerId) => {
  await client.rPush(`room:${roomId}:players`, playerId);
};

module.exports = addPlayer;
