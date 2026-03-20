const { RedisService } = require("@stop-the-bus/shared/redis");
const { client } = require("@stop-the-bus/shared/redis");
const {
  validateUserId,
  validateNickname,
} = require("@stop-the-bus/shared/validators");
const { InvalidInputError } = require("@stop-the-bus/shared/errors");

// Generate a unique alphanumeric room code with collision detection
const generateUniqueRoomCode = async () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    // Generate random 5-character alphanumeric code
    code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;

    // Check if code already exists in Redis
    const exists = await client.exists(`code:${code}`);
    if (!exists) {
      return code;
    }
  } while (attempts < maxAttempts);

  throw new Error("Could not generate unique room code after 10 attempts");
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

      // Use sanitized nickname for storage
      const cleanNickname = nicknameValidation.sanitized || nickname;

      // Generate unique room code with collision detection
      const roomCode = await generateUniqueRoomCode();
      const roomId = `room_${roomCode}`;

      // 2. Track userId -> socket.id mapping
      userSocketMap.set(userId, socket.id);

      // 3. Create the room in Redis with the code (using userId, not socket.id)
      await RedisService.createRoom(roomId, userId, roomCode);

      // 4. Store player metadata with sanitized nickname
      await RedisService.setPlayerMetadata(roomId, userId, cleanNickname);

      console.log(`✅ Host (${userId}) created room: ${roomCode}`);

      // 5. Join the Socket.io room immediately
      socket.currentRoom = roomId;
      socket.currentUserId = userId;
      socket.nickname = cleanNickname;
      socket.join(roomId);

      // 6. Broadcast PASSENGER_JOINED so the creator sees themselves
      // (No need to call getHost again - we know userId is the host)
      io.to(roomId).emit("PASSENGER_JOINED", {
        playerId: userId,
        nickname: cleanNickname,
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
