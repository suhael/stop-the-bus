const { client } = require("../client");

// Get all player answers for a specific round in a room
// Returns: { userId: answersObj, ... }
const getRoomAnswers = async (roomId, round) => {
  const key = `room:${roomId}:answers:${round}`;
  const raw = await client.hGetAll(key);
  const parsed = {};
  for (const [userId, json] of Object.entries(raw)) {
    try {
      parsed[userId] = JSON.parse(json);
    } catch {
      parsed[userId] = null;
    }
  }
  return parsed;
};

module.exports = getRoomAnswers;
