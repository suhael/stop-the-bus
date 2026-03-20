const { client } = require("../client");

// Get room status
const getRoomStatus = async (roomId) => {
  return await client.hGet(`room:${roomId}`, "status");
};

module.exports = getRoomStatus;
