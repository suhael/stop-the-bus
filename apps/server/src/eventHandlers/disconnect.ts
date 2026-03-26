import { removePlayerFromRoom } from "../utils/removePlayerFromRoom.ts";

// Event: Disconnect (network drop / app backgrounded)
// Uses a 5-second grace period so brief disconnects don't boot a player.
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
        await removePlayerFromRoom(io, roomId, userId);
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
