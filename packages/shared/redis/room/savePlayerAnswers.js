const { client } = require("../client");

// Save a player's answers for a specific round in a room
// roomId: string, round: number, userId: string, answers: object
const savePlayerAnswers = async (roomId, round, userId, answers) => {
  const key = `room:${roomId}:answers:${round}`;
  await client.hSet(key, userId, JSON.stringify(answers));
  // Set expiry for safety (24h)
  await client.expire(key, 60 * 60 * 24);
};

module.exports = savePlayerAnswers;
