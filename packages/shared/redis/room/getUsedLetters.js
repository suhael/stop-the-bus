const { client } = require("../client");

// Get all letters that have been used in this game
const getUsedLetters = async (roomId) => {
  return await client.sMembers(`room:${roomId}:usedLetters`);
};

module.exports = getUsedLetters;
