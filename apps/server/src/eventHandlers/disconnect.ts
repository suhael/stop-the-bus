import { RedisService } from "@stop-the-bus/shared/redis";

// Event: Disconnect
const disconnect = (socket: any, io: any, pendingDisconnects: Map<string, any>, userSocketMap: Map<string, string>) => {
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

        // Determine if the departing player is the current host before removing them
        const currentHostId = await RedisService.getHost(roomId);
        const isHostLeaving = currentHostId === userId;

        const newHostId = await RedisService.removePlayer(roomId, userId);

        if (newHostId === null) {
          // No players left - clean up entire room
          await RedisService.cleanupRoom(roomId);
          console.log(`🧹 Cleaned up empty room: ${roomId}`);
        } else {
          // Always notify remaining players that this player left.
          // Include newHostId only when the host actually changed so the
          // client can promote the new driver without a separate HOST_MIGRATED.
          io.to(roomId).emit("PASSENGER_LEFT", {
            playerId: userId,
            newHostId: isHostLeaving ? newHostId : undefined,
          });

          if (isHostLeaving) {
            if (roomStatus === "PLAYING" || roomStatus === "SCRAMBLE") {
              console.log(
                `⚠️  Host left during ${roomStatus} phase. New host assigned: ${newHostId}`,
              );
            }
            io.to(roomId).emit("HOST_MIGRATED", { newHostId });
            console.log(`👑 Host Migrated to: ${newHostId}`);
          }
        }
      } catch (err: any) {
        console.error(
          `❌ Error during player removal (${userId}):`,
          err?.message,
        );
      } finally {
        // Clean up memory - remove from grace period tracking
        pendingDisconnects.delete(userId);

        // DO NOT clear socket.scoringTimeout here - let it survive the disconnect
        // The room timeout belongs to the room, not the socket
        // This prevents "Sabotage Disconnect" where closing app stops scoring

        // Clean up user socket map to prevent memory leak
        userSocketMap.delete(userId);
      }
    }, 5000);

    pendingDisconnects.set(userId, timeoutId);
  };
};

export default disconnect;
