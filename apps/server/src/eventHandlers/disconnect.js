const { RedisService } = require("@stop-the-bus/shared/redis");

// Event: Disconnect
const disconnect = (socket, io, pendingDisconnects) => {
  return async () => {
    const roomId = socket.currentRoom;
    const playerId = socket.id;

    if (!roomId) return;

    console.log(
      `⚠️ Passenger ${playerId} lost connection. Waiting 5s for return...`
    );

    // Start the 5-second timer
    const timeoutId = setTimeout(async () => {
      console.log(
        `\n👣 Grace period ended. Removing Passenger ${playerId} from Bus: ${roomId}`
      );

      const newHostId = await RedisService.removePlayer(roomId, playerId);

      if (newHostId) {
        io.to(roomId).emit("HOST_MIGRATED", { newHostId });
        console.log(`👑 Host Migrated to: ${newHostId}`);
      }

      pendingDisconnects.delete(playerId);
    }, 5000);

    pendingDisconnects.set(playerId, timeoutId);
  };
};

module.exports = disconnect;
