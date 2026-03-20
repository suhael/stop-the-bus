const { client } = require("../client");

// Create a new room
const createRoom = async (roomId, hostId) => {
  await client.hSet(`room:${roomId}`, {
    host_id: hostId,
    status: "WAITING",
    round: "1",
    created_at: Date.now(),
  });
  // Add host to the player list (First in = Driver)
  await client.rPush(`room:${roomId}:players`, hostId);
};

module.exports = createRoom;
