import { Server } from "socket.io";
import { RedisService } from "@stop-the-bus/shared/redis";

/**
 * Shared player-removal logic used by both the intentional LEAVE_ROOM handler
 * and the grace-period disconnect timer.
 *
 * Idempotent: if the player is no longer in the room (e.g. already removed by a
 * concurrent path) it exits early without emitting any events.
 */
export async function removePlayerFromRoom(
  io: Server,
  roomId: string,
  userId: string,
): Promise<void> {
  // Idempotency guard — bail out if the player was already removed
  const players = await RedisService.getPlayers(roomId);
  if (!players.includes(userId)) {
    console.log(`ℹ️  removePlayerFromRoom: ${userId} already gone from ${roomId}, skipping.`);
    return;
  }

  const roomStatus = await RedisService.getRoomStatus(roomId);
  const currentHostId = await RedisService.getHost(roomId);
  const isHostLeaving = currentHostId === userId;

  const newHostId = await RedisService.removePlayer(roomId, userId);

  if (newHostId === null) {
    // No players left — clean up the entire room
    await RedisService.cleanupRoom(roomId);
    console.log(`🧹 Cleaned up empty room: ${roomId}`);
  } else {
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
}
