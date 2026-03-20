const { client } = require("../client");

// Create a new room
const createRoom = async (roomId, hostId, roomCode) => {
  await client.hSet(`room:${roomId}`, {
    host_id: hostId,
    status: "WAITING",
    round: "1",
    code: roomCode,
    created_at: Date.now(),
  });
  // Add host to the player list (First in = Driver)
  await client.rPush(`room:${roomId}:players`, hostId);

  // Store code -> roomId mapping for easy lookup
  await client.set(`code:${roomCode}`, roomId, { EX: 86400 }); // 24 hour expiry
};

module.exports = createRoom;
