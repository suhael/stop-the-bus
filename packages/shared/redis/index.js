const { client, connectRedis } = require("./client");
const createRoom = require("./room/createRoom");
const getHost = require("./room/getHost");
const getRoomFromCode = require("./room/getRoomFromCode");
const getRoomStatus = require("./room/getRoomStatus");
const getPlayers = require("./player/getPlayers");
const addPlayer = require("./player/addPlayer");
const removePlayer = require("./player/removePlayer");

/**
 * Game Logic Helpers
 */
const RedisService = {
  createRoom,
  getHost,
  getRoomFromCode,
  getRoomStatus,
  getPlayers,
  addPlayer,
  removePlayer,
};

module.exports = { client, connectRedis, RedisService };
