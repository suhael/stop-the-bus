const { client } = require("../client");

// Add a letter to the used letters set for this game
const addUsedLetter = async (roomId, letter) => {
  await client.sAdd(`room:${roomId}:usedLetters`, letter);
  // Set same TTL as room (24 hours)
  await client.expire(`room:${roomId}:usedLetters`, 86400);
};

module.exports = addUsedLetter;
