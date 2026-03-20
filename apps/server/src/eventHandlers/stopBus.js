const { RedisService } = require("@stop-the-bus/shared/redis");

// Event: Stop the Bus - Triggered when a player finishes all categories
const stopBus = (socket, io) => {
  return async (payload) => {
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

      // 1. Check if room exists and status is PLAYING
      const roomStatus = await RedisService.getRoomStatus(roomId);
      if (!roomStatus) {
        socket.emit("ERROR", {
          code: "ROOM_NOT_FOUND",
          message: "Room no longer exists.",
        });
        return;
      }
      if (roomStatus !== "PLAYING") {
        socket.emit("ERROR", {
          code: "INVALID_GAME_STATE",
          message: "Game is not in progress. Cannot stop the bus now.",
        });
        return;
      }

      // 2. Immediately change status to SCRAMBLE
      await RedisService.updateRoomStatus(roomId, "SCRAMBLE");

      console.log(
        `🛑 Player ${userId} stopped the bus! Room ${roomId} now in SCRAMBLE mode.`,
      );

      // 3. Validate that userId is in the room players list
      const players = await RedisService.getPlayers(roomId);
      if (!players.includes(userId)) {
        socket.emit("ERROR", {
          code: "INVALID_STATE",
          message: "Player is not in this room.",
        });
        return;
      }

      // 4. Emit START_SCRAMBLE with 3-second duration to all players
      io.to(roomId).emit("START_SCRAMBLE", {
        timeRemaining: 3,
        stopClickedBy: userId,
      });

      // 5. Set server-side timeout for 3.5 seconds to trigger scoring
      // (Extra 0.5 seconds buffer to ensure all client messages arrive)
      const scoringTimeoutId = setTimeout(async () => {
        try {
          console.log(
            `⏱️  Scramble time expired. Transitioning room ${roomId} to SCORING phase.`,
          );

          // Update room status to SCORING
          await RedisService.updateRoomStatus(roomId, "SCORING");

          // Emit signal to all players that scoring phase has begun
          io.to(roomId).emit("SCORING_PHASE_BEGIN", {
            timestamp: Date.now(),
          });
        } catch (err) {
          console.error(
            `❌ Error transitioning to SCORING phase (${roomId}):`,
            err.message,
          );
        }
      }, 3500);

      // Store timeout ID in case we need to cancel (e.g., if all players disconnect)
      // Could be extended to store in Redis if needed
      socket.scoringTimeout = scoringTimeoutId;
    } catch (err) {
      console.error("🚨 Stop Bus Error:", {
        userId: socket.currentUserId,
        roomId: socket.currentRoom,
        error: err.message,
        code: err.code,
      });
      socket.emit("ERROR", {
        code: err.code || "STOP_BUS_FAILED",
        message: err.message || "Could not stop the bus.",
      });
    }
  };
};

module.exports = stopBus;
