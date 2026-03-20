const { RedisService } = require("@stop-the-bus/shared/redis");
const {
  validateUserId,
  validateNickname,
} = require("@stop-the-bus/shared/validators");
const { InvalidInputError } = require("@stop-the-bus/shared/errors");

// Generate a random 5-digit room code
const generateRoomCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Event: Create a new room (Host only)
const createRoom = (socket, io, userSocketMap) => {
  return async ({ userId, nickname }) => {
    try {
      // 1. Validate inputs
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.valid) {
        throw new InvalidInputError("userId", userIdValidation.error);
      }

      const nicknameValidation = validateNickname(nickname);
      if (!nicknameValidation.valid) {
        throw new InvalidInputError("nickname", nicknameValidation.error);
      }

      const roomCode = generateRoomCode();
      const roomId = `room_${roomCode}`;

      // 2. Track userId -> socket.id mapping
      userSocketMap.set(userId, socket.id);

      // 3. Create the room in Redis with the code (using userId, not socket.id)
      await RedisService.createRoom(roomId, userId, roomCode);

      // 4. Store player metadata
      await RedisService.setPlayerMetadata(roomId, userId, nickname);

      console.log(`✅ Host (${userId}) created room: ${roomCode}`);

      // 5. Join the Socket.io room immediately
      socket.currentRoom = roomId;
      socket.currentUserId = userId;
      socket.nickname = nickname;
      socket.join(roomId);

      // 6. Broadcast PASSENGER_JOINED so the creator sees themselves
      // (No need to call getHost again - we know userId is the host)
      io.to(roomId).emit("PASSENGER_JOINED", {
        playerId: userId,
        nickname: nickname,
        isDriver: true,
      });

      // 7. Return the code to the client so they can share it
      socket.emit("ROOM_CREATED", { roomCode, roomId });
    } catch (err) {
      console.error("🚨 Room Creation Error:", {
        userId: arguments[0]?.userId,
        error: err.message,
        code: err.code,
      });
      socket.emit("ERROR", {
        code: err.code || "CREATE_ROOM_FAILED",
        message: err.message || "Could not create room.",
      });
    }
  };
};

module.exports = createRoom;
