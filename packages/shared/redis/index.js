const { client, connectRedis } = require("./client");
const createRoom = require("./room/createRoom");
const getHost = require("./room/getHost");
const getRoomFromCode = require("./room/getRoomFromCode");
const getRoomStatus = require("./room/getRoomStatus");
const getRoomIdForUser = require("./room/getRoomIdForUser");
const cleanupRoom = require("./room/cleanupRoom");
const getPlayers = require("./player/getPlayers");
const getPlayersWithNicknames = require("./player/getPlayersWithNicknames");
const addPlayer = require("./player/addPlayer");
const setPlayerMetadata = require("./player/setPlayerMetadata");
const removePlayer = require("./player/removePlayer");

/**
 * Game Logic Helpers
 */
const RedisService = {
  createRoom,
  getHost,
  getRoomFromCode,
  getRoomStatus,
  getRoomIdForUser,
  cleanupRoom,
  getPlayers,
  getPlayersWithNicknames,
  addPlayer,
  setPlayerMetadata,
  removePlayer,
};

module.exports = { client, connectRedis, RedisService };
