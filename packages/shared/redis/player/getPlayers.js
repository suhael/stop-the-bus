const { client } = require("../client");

// Get all players in order
const getPlayers = async (roomId) => {
  return await client.lRange(`room:${roomId}:players`, 0, -1);
};

module.exports = getPlayers;
