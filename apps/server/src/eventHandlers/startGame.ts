import { RedisService, client } from "@stop-the-bus/shared/redis";
import {
  RoomNotFoundError,
  NotHostError,
  InsufficientPlayersError,
  NoLettersAvailableError,
  GameAlreadyInProgressError,
} from "@stop-the-bus/shared/errors";
import { getCategories } from "@stop-the-bus/shared/logic/dictionary";
import roundResults from "./roundResults.ts";

const ROUND_DURATION_SECONDS = 180;

// Generate a random letter that hasn't been used in this game yet
const getRandomUnusedLetter = async (roomId: string): Promise<string> => {
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Get previously used letters in this room
  const usedLetters = await RedisService.getUsedLetters(roomId);

  // Filter out used letters
  const availableLetters = allLetters.filter(
    (letter) => !usedLetters.includes(letter),
  );

  if (availableLetters.length === 0) {
    throw new NoLettersAvailableError();
  }

  // Pick a random letter from available
  const randomLetter =
    availableLetters[Math.floor(Math.random() * availableLetters.length)];

  // Add to used letters
  await RedisService.addUsedLetter(roomId, randomLetter);

  return randomLetter;
};

// Event: Start the Game (Host only)
const startGame = (socket: any, io: any, roomScoringTimeouts: Map<string, any>) => {
  return async () => {
    try {
      const roomId = socket.currentRoom;
      const userId = socket.currentUserId;

      if (!roomId || !userId) {
        socket.emit("ERROR", {
          code: "INVALID_STATE",
          message: "Not in a room",
        });
        return;
      }

      // 1. Verify the requester is the host
      const hostId = await RedisService.getHost(roomId);
      if (!hostId) {
        throw new RoomNotFoundError();
      }
      if (userId !== hostId) {
        console.log(
          `⛔ Non-host (${userId}) attempted to start game in room ${roomId}`,
        );
        throw new NotHostError();
      }

      // 2. Get current room status
      const roomStatus = await RedisService.getRoomStatus(roomId);
      if (roomStatus !== "WAITING" && roomStatus !== "RESULTS_SHOWN") {
        throw new GameAlreadyInProgressError();
      }

      // 3. Verify at least 2 players before starting
      const players = await RedisService.getPlayers(roomId);
      if (players.length < 2) {
        throw new InsufficientPlayersError();
      }

      // 4. Get current round and increment if we are moving to the next round
      let currentRoundStr = await RedisService.getRound(roomId);
      if (!currentRoundStr) {
        throw new Error("Could not retrieve round number");
      }
      
      let currentRound = parseInt(currentRoundStr, 10);
      if (roomStatus === "RESULTS_SHOWN") {
        currentRound += 1;
      }

      // 5. Select a random letter that hasn't been used
      const letter = await getRandomUnusedLetter(roomId);

      // 6. Update room status and letter atomically using a transaction
      const roundEndTime = Date.now() + ROUND_DURATION_SECONDS * 1000;
      const transaction = client.multi();
      transaction.hSet(`room:${roomId}`, "status", "PLAYING");
      transaction.hSet(`room:${roomId}`, "letter", letter);
      transaction.hSet(`room:${roomId}`, "stopClickedBy", "");
      transaction.hSet(`room:${roomId}`, "roundEndTime", roundEndTime.toString());
      if (roomStatus === "RESULTS_SHOWN") {
        transaction.hSet(`room:${roomId}`, "round", currentRound.toString());
      }
      await transaction.exec();

      console.log(
        `🎮 Game started in room ${roomId} | Round: ${currentRound} | Letter: ${letter}`,
      );

      // 7. Emit GAME_STARTED to the room with letter and round number
      io.to(roomId).emit("GAME_STARTED", {
        letter,
        round: currentRound,
        categories: getCategories(),
        roundEndTime,
      });

      // 8. Start the round timer — if it fires before STOP_CLICKED, trigger scramble automatically
      const existingTimer = roomScoringTimeouts.get(roomId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const roundTimerId = setTimeout(async () => {
        try {
          const roomStatus = await RedisService.getRoomStatus(roomId);
          if (roomStatus !== "PLAYING") return; // Already in scramble/scoring

          console.log(
            `⏰ Round timer expired for room ${roomId}. Triggering scramble (no bus stopper bonus).`,
          );

          await RedisService.updateRoomStatus(roomId, "SCRAMBLE");

          io.to(roomId).emit("START_SCRAMBLE", {
            timeRemaining: 10,
            stopClickedBy: null,
          });

          const scrambleTimerId = setTimeout(async () => {
            try {
              await RedisService.updateRoomStatus(roomId, "SCORING");
              io.to(roomId).emit("SCORING_PHASE_BEGIN", { timestamp: Date.now() });
              await roundResults(io)(roomId);
            } catch (err) {
              console.error(
                `❌ Scoring error after round timeout (${roomId}):`,
                (err as any).message,
              );
            } finally {
              roomScoringTimeouts.delete(roomId);
            }
          }, 13000);

          roomScoringTimeouts.set(roomId, scrambleTimerId);
        } catch (err) {
          console.error(
            `❌ Round timer error (${roomId}):`,
            (err as any).message,
          );
          roomScoringTimeouts.delete(roomId);
        }
      }, ROUND_DURATION_SECONDS * 1000);

      roomScoringTimeouts.set(roomId, roundTimerId);
      console.log(
        `⏱️  Round timer started for room ${roomId} (${ROUND_DURATION_SECONDS}s).`,
      );
    } catch (err: any) {
      console.error("🚨 Start Game Error:", {
        userId: socket.currentUserId,
        roomId: socket.currentRoom,
        error: err?.message,
        code: err?.code,
      });
      socket.emit("ERROR", {
        code: err?.code || "START_GAME_FAILED",
        message: err?.message || "Could not start the game",
      });
    }
  };
};

export default startGame;
