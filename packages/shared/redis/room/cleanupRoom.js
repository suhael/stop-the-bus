const { client } = require("../client");

// Clean up all player metadata and room keys for a deleted room
const cleanupRoom = async (roomId) => {
  // Get all keys matching this room pattern
  const pattern = `room:${roomId}*`;
  const keys = await client.keys(pattern);

  if (keys.length > 0) {
    await client.del(...keys);
  }
};

module.exports = cleanupRoom;
