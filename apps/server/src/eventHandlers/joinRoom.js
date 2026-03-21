const { RedisService } = require("@stop-the-bus/shared/redis");
const {
  validateUserId,
  validateNickname,
  validateRoomCode,
} = require("@stop-the-bus/shared/validators");
const {
  InvalidInputError,
  RoomNotFoundError,
  RoomNotWaitingError,
  NicknameTakenError,
} = require("@stop-the-bus/shared/errors");
const { getCategories } = require("@stop-the-bus/shared/logic/dictionary");

// Event: Joining a Room
const joinRoom = (socket, io, pendingDisconnects, userSocketMap) => {
  return async ({ roomCode, userId, nickname }) => {
    // Handle reconnection from grace period
    if (pendingDisconnects.has(userId)) {
      clearTimeout(pendingDisconnects.get(userId));
      pendingDisconnects.delete(userId);

      // Validate and sanitize nickname for log message
      const nicknameValidation = validateNickname(nickname);
      const displayName = nicknameValidation.valid
        ? nicknameValidation.sanitized || nickname
        : nickname;

      console.log(
        `✨ Player ${displayName} (${userId}) returned just in time!`,
      );

      // Look up roomId from the code sent by client
      const roomId = await RedisService.getRoomFromCode(roomCode);
      if (!roomId) {
        socket.emit("ERROR", {
          code: "ROOM_NOT_FOUND",
          message: "Room no longer exists",
        });
        return;
      }

      // Restore connection for this userId
      userSocketMap.set(userId, socket.id);
      socket.currentUserId = userId;
      socket.currentRoom = roomId;
      socket.join(roomId);

      io.to(roomId).emit("PLAYER_RECONNECTED", { playerId: userId });
      return;
    }

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

      const roomCodeValidation = validateRoomCode(roomCode);
      if (!roomCodeValidation.valid) {
        throw new InvalidInputError("roomCode", roomCodeValidation.error);
      }

      // Use sanitized nickname for storage
      const cleanNickname = nicknameValidation.sanitized || nickname;

      // 2. Look up roomId from the room code
      const roomId = await RedisService.getRoomFromCode(roomCode);
      if (!roomId) {
        throw new RoomNotFoundError();
      }

      // 3. Check if room is still in WAITING status
      const roomStatus = await RedisService.getRoomStatus(roomId);
      if (roomStatus !== "WAITING") {
        throw new RoomNotWaitingError();
      }

      // 4. Check for duplicate nicknames
      const existingPlayers =
        await RedisService.getPlayersWithNicknames(roomId);
      if (existingPlayers.some((p) => p.nickname === cleanNickname)) {
        throw new NicknameTakenError();
      }

      // 5. Track userId -> socket.id mapping
      userSocketMap.set(userId, socket.id);

      // 6. Attach the roomId and userId to the socket
      socket.currentRoom = roomId;
      socket.currentUserId = userId;
      socket.nickname = cleanNickname;
      socket.reconnectRoom = roomId; // For reconnection handling

      // 7. Physical join to the Socket.io room
      socket.join(roomId);

      // 8. Add player to room in Redis (using userId, not socket.id)
      const players = await RedisService.getPlayers(roomId);
      if (!players.includes(userId)) {
        await RedisService.addPlayer(roomId, userId);
      }

      // Always refresh metadata (handles reconnections and prevents expiry)
      await RedisService.setPlayerMetadata(roomId, userId, cleanNickname);

      console.log(`✅ ${cleanNickname} (${userId}) boarded Bus: ${roomId}`);

      // 9. Broadcast PASSENGER_JOINED to everyone including themselves
      const hostId = await RedisService.getHost(roomId);
      io.to(roomId).emit("PASSENGER_JOINED", {
        playerId: userId,
        nickname: cleanNickname,
        isDriver: userId === hostId,
        categories: getCategories(),
      });
    } catch (err) {
      console.error("🚨 Boarding Error:", {
        userId: arguments[0]?.userId,
        roomCode: arguments[0]?.roomCode,
        error: err.message,
        code: err.code,
      });
      socket.emit("ERROR", {
        code: err.code || "JOIN_ROOM_FAILED",
        message: err.message || "Could not join the bus.",
      });
    }
  };
};

module.exports = joinRoom;
