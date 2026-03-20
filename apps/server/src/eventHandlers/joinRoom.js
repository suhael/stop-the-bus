const { RedisService } = require("@stop-the-bus/shared/redis");

// Event: Joining a Room
const joinRoom = (socket, io, pendingDisconnects) => {
  return async ({ roomCode, nickname }) => {
    if (pendingDisconnects.has(socket.id)) {
      clearTimeout(pendingDisconnects.get(socket.id));
      pendingDisconnects.delete(socket.id);
      console.log(`✨ Passenger ${nickname} returned just in time!`);
      return; // They are already in the Redis list/room, no need to re-add
    }
    try {
      // 1. Look up roomId from the room code
      const roomId = await RedisService.getRoomFromCode(roomCode);
      if (!roomId) {
        socket.emit("ERROR", { message: "Invalid room code." });
        return;
      }

      // 2. Check if room is still in WAITING/LOBBY status
      const roomStatus = await RedisService.getRoomStatus(roomId);
      if (roomStatus !== "WAITING") {
        socket.emit("ERROR", {
          message: "This room is no longer accepting players.",
        });
        return;
      }

      // 3. Attach the roomId to the socket instance for the disconnect listener
      socket.currentRoom = roomId;
      socket.nickname = nickname;

      // 4. Physical join to the Socket.io room
      socket.join(roomId);

      // 5. Add player to room in Redis (if not already there)
      // Check if player already exists (from reconnect)
      const players = await RedisService.getPlayers(roomId);
      if (!players.includes(socket.id)) {
        await RedisService.addPlayer(roomId, socket.id);
      }

      console.log(`✅ ${nickname} (${socket.id}) boarded Bus: ${roomId}`);

      // 6. Broadcast to the room
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
