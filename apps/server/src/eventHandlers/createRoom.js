const { RedisService } = require("@stop-the-bus/shared/redis");

// Generate a random 5-digit room code
const generateRoomCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Event: Create a new room (Host only)
const createRoom = (socket, io) => {
  return async () => {
    try {
      const roomCode = generateRoomCode();
      const roomId = `room_${roomCode}`;

      // Create the room in Redis with the code
      await RedisService.createRoom(roomId, socket.id, roomCode);

      console.log(`✅ Host (${socket.id}) created room: ${roomCode}`);

      // Return the code to the client
      socket.emit("ROOM_CREATED", { roomCode, roomId });
    } catch (err) {
      console.error("🚨 Room Creation Error:", err);
      socket.emit("ERROR", { message: "Could not create room." });
    }
  };
};

module.exports = createRoom;
