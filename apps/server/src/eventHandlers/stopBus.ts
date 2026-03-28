import { RedisService, client } from "@stop-the-bus/shared/redis";
import roundResults from "./roundResults.ts";

// Event: Stop the Bus - Triggered when a player finishes all categories
const stopBus = (socket: any, io: any, roomScoringTimeouts: Map<string, any>) => {
  return async (payload: any) => {
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
      
      // 2. Validate that userId is in the room players list
      const players = await RedisService.getPlayers(roomId);
      if (!players.includes(userId)) {
        socket.emit("ERROR", {
          code: "INVALID_STATE",
          message: "Player is not in this room.",
        });
        return;
      }

      // 3. Cancel the active round timer so it doesn't fire after scramble starts
      const existingTimer = roomScoringTimeouts.get(roomId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        roomScoringTimeouts.delete(roomId);
      }

      // 4. Immediately change status to SCRAMBLE and persist who stopped
      await Promise.all([
        RedisService.updateRoomStatus(roomId, "SCRAMBLE"),
        client.hSet(`room:${roomId}`, "stopClickedBy", userId),
      ]);

      console.log(
        `🛑 Player ${userId} stopped the bus! Room ${roomId} now in SCRAMBLE mode.`,
      );


      // 5. Emit START_SCRAMBLE with 10-second duration to all players
      io.to(roomId).emit("START_SCRAMBLE", {
        timeRemaining: 10,
        stopClickedBy: userId,
      });

      // 6. Set server-side timeout for 13 seconds to trigger scoring
      // (3s grace period beyond the 10s scramble for mobile network latency)
      // Store timeout in room map (survives socket disconnect)
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

          // Trigger scoring logic
          await roundResults(io)(roomId);
        } catch (err) {
          console.error(
            `❌ Error transitioning to SCORING phase (${roomId}):`,
            (err as any).message,
          );
        } finally {
          // Clean up the timeout reference from the map
          roomScoringTimeouts.delete(roomId);
        }
      }, 13000);

      // Store timeout in room map (survives socket disconnect)
      roomScoringTimeouts.set(roomId, scoringTimeoutId);
    } catch (err: any) {
      console.error("🚨 Stop Bus Error:", {
        userId: socket.currentUserId,
        roomId: socket.currentRoom,
        error: err?.message,
        code: err?.code,
      });
      socket.emit("ERROR", {
        code: err?.code || "STOP_BUS_FAILED",
        message: err?.message || "Could not stop the bus.",
      });
    }
  };
};

export default stopBus;
