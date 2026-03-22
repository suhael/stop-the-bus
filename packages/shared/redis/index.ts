
import { client, connectRedis } from "./client";
import { createRoom } from "./room/createRoom";
import { getHost } from "./room/getHost";
import { getRoomFromCode } from "./room/getRoomFromCode";
import { getRoomStatus } from "./room/getRoomStatus";
import { getRoomIdForUser } from "./room/getRoomIdForUser";
import { getRound } from "./room/getRound";
import { updateRoomStatus } from "./room/updateRoomStatus";
import { setLetter } from "./room/setLetter";
import { getUsedLetters } from "./room/getUsedLetters";
import { addUsedLetter } from "./room/addUsedLetter";
import { cleanupRoom } from "./room/cleanupRoom";
import { getPlayers } from "./player/getPlayers";
import { getPlayersWithNicknames } from "./player/getPlayersWithNicknames";
import { addPlayer } from "./player/addPlayer";
import { setPlayerMetadata } from "./player/setPlayerMetadata";
import { removePlayer } from "./player/removePlayer";
import { savePlayerAnswers } from "./room/savePlayerAnswers";
import { getRoomAnswers } from "./room/getRoomAnswers";

/**
 * Game Logic Helpers
 */
export const RedisService = {
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

export { client, connectRedis };
