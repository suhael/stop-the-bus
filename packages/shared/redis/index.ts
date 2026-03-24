
import { client, connectRedis } from "./client.ts";
import { createRoom } from "./room/createRoom.ts";
import { getHost } from "./room/getHost.ts";
import { getRoomFromCode } from "./room/getRoomFromCode.ts";
import { getRoomStatus } from "./room/getRoomStatus.ts";
import { getRoomIdForUser } from "./room/getRoomIdForUser.ts";
import { getRound } from "./room/getRound.ts";
import { updateRoomStatus } from "./room/updateRoomStatus.ts";
import { setLetter } from "./room/setLetter.ts";
import { getUsedLetters } from "./room/getUsedLetters.ts";
import { addUsedLetter } from "./room/addUsedLetter.ts";
import { cleanupRoom } from "./room/cleanupRoom.ts";
import { getPlayers } from "./player/getPlayers.ts";
import { getPlayersWithNicknames } from "./player/getPlayersWithNicknames.ts";
import { addPlayer } from "./player/addPlayer.ts";
import { setPlayerMetadata } from "./player/setPlayerMetadata.ts";
import { removePlayer } from "./player/removePlayer.ts";
import { savePlayerAnswers } from "./room/savePlayerAnswers.ts";
import { getRoomAnswers } from "./room/getRoomAnswers.ts";

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
