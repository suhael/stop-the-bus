const { RedisService } = require("@stop-the-bus/shared/redis");

// Event: Joining a Room
const joinRoom = (socket, io, pendingDisconnects) => {
  return async ({ roomId, nickname }) => {
    if (pendingDisconnects.has(socket.id)) {
      clearTimeout(pendingDisconnects.get(socket.id));
      pendingDisconnects.delete(socket.id);
      console.log(`✨ Passenger ${nickname} returned just in time!`);
      return; // They are already in the Redis list/room, no need to re-add
    }
    try {
      // 1. Attach the roomId to the socket instance for the disconnect listener
      socket.currentRoom = roomId;
      socket.nickname = nickname; // Useful for logs later!

      // 2. Physical join to the Socket.io room
      socket.join(roomId);

      // 3. Update Redis state
      await RedisService.createRoom(roomId, socket.id);

      console.log(`✅ ${nickname} (${socket.id}) boarded Bus: ${roomId}`);

      // 4. Broadcast to the room
      const hostId = await RedisService.getHost(roomId);
      io.to(roomId).emit("PASSENGER_JOINED", {
        playerId: socket.id,
        nickname: nickname,
        isDriver: socket.id === hostId,
      });
    } catch (err) {
      console.error("🚨 Boarding Error:", err);
      socket.emit("ERROR", { message: "Could not join the bus." });
    }
  };
};

module.exports = joinRoom;
