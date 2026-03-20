const { RedisService } = require("@stop-the-bus/shared/redis");

// Event: Disconnect
const disconnect = (socket, io, pendingDisconnects, userSocketMap) => {
  return async () => {
    const roomId = socket.currentRoom;
    const userId = socket.currentUserId;

    if (!roomId || !userId) {
      console.warn(
        `⚠️ Disconnect: Missing socket state (room: ${roomId}, user: ${userId})`,
      );
      return;
    }

    console.log(
      `⚠️ Player ${userId} lost connection. Waiting 5s for return...`,
    );

    // Start the 5-second grace period timer
    const timeoutId = setTimeout(async () => {
      console.log(
        `\n👣 Grace period ended. Removing Player ${userId} from Bus: ${roomId}`,
      );

      try {
        // Check room status to determine if special handling is needed
        const roomStatus = await RedisService.getRoomStatus(roomId);

        const newHostId = await RedisService.removePlayer(roomId, userId);

        if (newHostId) {
          // If host left during active gameplay, notify all players
          if (roomStatus === "PLAYING" || roomStatus === "SCRAMBLE") {
            console.log(
              `⚠️  Host left during ${roomStatus} phase. New host assigned: ${newHostId}`,
            );
          }
          io.to(roomId).emit("HOST_MIGRATED", { newHostId });
          console.log(`👑 Host Migrated to: ${newHostId}`);
        } else {
          // No players left - clean up entire room
          await RedisService.cleanupRoom(roomId);
          console.log(`🧹 Cleaned up empty room: ${roomId}`);
        }
      } catch (err) {
        console.error(
          `❌ Error during player removal (${userId}):`,
          err.message,
        );
      } finally {
        // Clean up memory - remove from grace period tracking
        pendingDisconnects.delete(userId);

        // Clear any pending scoring timeout
        if (socket.scoringTimeout) {
          clearTimeout(socket.scoringTimeout);
        }

        // Clean up user socket map to prevent memory leak
        userSocketMap.delete(userId);
      }
    }, 5000);

    pendingDisconnects.set(userId, timeoutId);
  };
};

module.exports = disconnect;
