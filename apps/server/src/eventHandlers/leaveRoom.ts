import { removePlayerFromRoom } from "../utils/removePlayerFromRoom.ts";

// Event: Intentional leave — fired when a player taps "Leave Room"
const leaveRoom = (
  socket: any,
  io: any,
  pendingDisconnects: Map<string, NodeJS.Timeout>,
  userSocketMap: Map<string, string>,
) => {
  return async () => {
    const roomId = socket.currentRoom;
    const userId = socket.currentUserId;

    if (!roomId || !userId) return;

    console.log(`🚪 Player ${userId} intentionally left room: ${roomId}`);

    // Cancel any in-flight grace-period timer so disconnect.ts doesn't
    // fire a second removal after the player has already cleanly left.
    if (pendingDisconnects.has(userId)) {
      clearTimeout(pendingDisconnects.get(userId));
      pendingDisconnects.delete(userId);
    }

    try {
      await removePlayerFromRoom(io, roomId, userId);
    } catch (err: any) {
      console.error(`❌ Error during intentional leave (${userId}):`, err?.message);
    } finally {
      // Unsubscribe the live socket from the room's broadcast channel so it
      // no longer receives events meant for players still in the game.
      socket.leave(roomId);

      // Clear socket state so a subsequent disconnect event is a no-op.
      socket.currentRoom = undefined;
      socket.currentUserId = undefined;
      socket.nickname = undefined;

      userSocketMap.delete(userId);
    }
  };
};

export default leaveRoom;
