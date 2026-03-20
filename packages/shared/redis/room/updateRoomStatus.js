const { client } = require("../client");

// Update the room status (WAITING, PLAYING, SCRAMBLE, SCORING)
const updateRoomStatus = async (roomId, status) => {
  await client.hSet(`room:${roomId}`, "status", status);
};

module.exports = updateRoomStatus;
