const { client } = require("../client");

// Remove a player and return the new host if the old one left
const removePlayer = async (roomId, playerId) => {
  const currentHost = await client.hGet(`room:${roomId}`, "host_id");

  // Remove player from the ordered list
  await client.lRem(`room:${roomId}:players`, 0, playerId);

  // Get the next person in line
  const nextInLine = await client.lIndex(`room:${roomId}:players`, 0);

  // If the person leaving was the host AND there's someone else left
  if (currentHost === playerId && nextInLine) {
    await client.hSet(`room:${roomId}`, "host_id", nextInLine);
    return nextInLine; // New Host ID
  }

  // If no one is left, you might want to delete the room entirely
  if (!nextInLine) {
    await client.del(`room:${roomId}`);
    await client.del(`room:${roomId}:players`);
    return null;
  }

  return currentHost; // Host remains the same
};

module.exports = removePlayer;
