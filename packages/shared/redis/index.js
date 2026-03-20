const { client, connectRedis } = require("./client");
const createRoom = require("./room/createRoom");
const getHost = require("./room/getHost");
const getPlayers = require("./player/getPlayers");
const removePlayer = require("./player/removePlayer");

/**
 * Game Logic Helpers
 */
const RedisService = {
  createRoom,
  getHost,
  getPlayers,
  removePlayer,
};

module.exports = { client, connectRedis, RedisService };
