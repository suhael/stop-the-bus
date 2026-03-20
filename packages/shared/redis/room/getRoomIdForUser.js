const { client } = require("../client");

// Look up roomId for a user (useful for reconnection)
const getRoomIdForUser = async (userId) => {
  // This would require scanning rooms - simpler approach is to store it separately
  // For now, clients should provide roomCode on reconnect
  return null; // TODO: Implement if needed
};

module.exports = getRoomIdForUser;
