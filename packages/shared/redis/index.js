const { client, connectRedis } = require("./client");
const createRoom = require("./room/createRoom");
const getHost = require("./room/getHost");
const getRoomFromCode = require("./room/getRoomFromCode");
const getRoomStatus = require("./room/getRoomStatus");
const getRoomIdForUser = require("./room/getRoomIdForUser");
const getRound = require("./room/getRound");
const updateRoomStatus = require("./room/updateRoomStatus");
const setLetter = require("./room/setLetter");
const getUsedLetters = require("./room/getUsedLetters");
const addUsedLetter = require("./room/addUsedLetter");
const cleanupRoom = require("./room/cleanupRoom");
const getPlayers = require("./player/getPlayers");
const getPlayersWithNicknames = require("./player/getPlayersWithNicknames");
const addPlayer = require("./player/addPlayer");
const setPlayerMetadata = require("./player/setPlayerMetadata");
const removePlayer = require("./player/removePlayer");
const savePlayerAnswers = require("./room/savePlayerAnswers");
const getRoomAnswers = require("./room/getRoomAnswers");

/**
 * Game Logic Helpers
 */
const RedisService = {
  createRoom,
  getHost,
  getRoomFromCode,
  getRoomStatus,
  getRoomIdForUser,
  getRound,
  updateRoomStatus,
  setLetter,
  getUsedLetters,
  addUsedLetter,
  cleanupRoom,
  getPlayers,
  getPlayersWithNicknames,
  addPlayer,
  setPlayerMetadata,
  removePlayer,
  savePlayerAnswers,
  getRoomAnswers,
};

module.exports = { client, connectRedis, RedisService };
