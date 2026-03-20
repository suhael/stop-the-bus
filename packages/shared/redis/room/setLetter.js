const { client } = require("../client");

// Set the current letter for the round
const setLetter = async (roomId, letter) => {
  await client.hSet(`room:${roomId}`, "letter", letter);
};

module.exports = setLetter;
