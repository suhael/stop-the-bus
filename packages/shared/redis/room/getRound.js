const { client } = require("../client");

// Get the current round number for a room
const getRound = async (roomId) => {
  return await client.hGet(`room:${roomId}`, "round");
};

module.exports = getRound;
