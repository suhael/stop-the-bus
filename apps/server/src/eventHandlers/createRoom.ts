
import { RedisService, client } from "@stop-the-bus/shared/redis";
import { validateUserId, validateNickname } from "@stop-the-bus/shared/validators";
import { InvalidInputError } from "@stop-the-bus/shared/errors";

// Generate a unique alphanumeric room code with atomic collision detection
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

    // CRITICAL FIX: Use SET NX for atomic "check and set" to prevent race condition
    // In concurrent environment, two reqs could both pass exists() check
    // SET NX is atomic - only one will succeed
    const result = await client.set(`code:${code}`, `temp_${code}`, {
      NX: true,
      EX: 86400, // 24 hour expiry
    });
    if (result !== null) {
      return code; // Successfully created - no collision
    }
  } while (attempts < maxAttempts);

  throw new Error("Could not generate unique room code after 10 attempts");
};

// Event: Create a new room (Host only)
const createRoom = (socket: any, io: any, userSocketMap: Map<string, string>) => {
  return async ({ userId, nickname }: { userId: string; nickname: string }) => {
    try {
      // 1. Validate inputs
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.valid) {
        throw new InvalidInputError("userId", userIdValidation.error ?? "Invalid");
      }

      const nicknameValidation = validateNickname(nickname);
      if (!nicknameValidation.valid) {
        throw new InvalidInputError("nickname", nicknameValidation.error ?? "Invalid");
      }

      // Use sanitized nickname for storage
      const cleanNickname = nicknameValidation.sanitized || nickname;

      // Generate unique room code with atomic collision detection
      const roomCode = await generateUniqueRoomCode();
      const roomId = `room_${roomCode}`;

      // 2. Track userId -> socket.id mapping
      userSocketMap.set(userId, socket.id);

      // 3. Create the room in Redis with the code (using userId, not socket.id)
      //    RedisService.createRoom already writes code:{roomCode} -> roomId, so no
      //    separate client.set is needed here.
      await RedisService.createRoom(roomId, userId, roomCode);

      // 4. Store player metadata with sanitized nickname
      await RedisService.setPlayerMetadata(roomId, userId, cleanNickname);

      console.log(`✅ Host (${userId}) created room: ${roomCode}`);

      // 5. Return the code to the client — the client will immediately emit JOIN_ROOM
      //    which goes through the normal joinRoom flow (socket.join, player list, etc.)
      socket.emit("ROOM_CREATED", { roomCode, roomId });
    } catch (err: any) {
      console.error("🚨 Room Creation Error:", {
        error: err?.message,
        code: err?.code,
      });
      socket.emit("ERROR", {
        code: err?.code || "CREATE_ROOM_FAILED",
        message: err?.message || "Could not create room.",
      });
    }
  };
};

export default createRoom;
