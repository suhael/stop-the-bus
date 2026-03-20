const { client } = require("../client");

// Look up roomId from a room code
const getRoomFromCode = async (roomCode) => {
  return await client.get(`code:${roomCode}`);
};

module.exports = getRoomFromCode;
