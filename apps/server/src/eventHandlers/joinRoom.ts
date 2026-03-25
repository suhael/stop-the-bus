// apps/server/src/eventHandlers/joinRoom.ts
import { Server, Socket } from "socket.io";
import { RedisService } from "@stop-the-bus/shared/redis";
import {
  validateUserId,
  validateNickname,
  validateRoomCode,
} from "@stop-the-bus/shared/validators";
import { getCategories } from "@stop-the-bus/shared/logic/dictionary";

// Extend the Socket type safely for our custom properties
interface GameSocket extends Socket {
  currentRoom?: string;
  currentUserId?: string;
  nickname?: string;
  reconnectRoom?: string;
}

export const joinRoom = (
  socket: GameSocket,
  io: Server,
  pendingDisconnects: Map<string, NodeJS.Timeout>,
  userSocketMap: Map<string, string>
) => {
  return async ({ roomCode, userId, nickname }: { roomCode: string; userId: string; nickname: string }) => {
    try {
      // 1. Validation Checks
      const codeValidation = validateRoomCode(roomCode);
      if (!codeValidation.valid) {
        socket.emit("ERROR", { code: "INVALID_INPUT", message: codeValidation.error });
        return;
      }

      const userValidation = validateUserId(userId);
      if (!userValidation.valid) {
        socket.emit("ERROR", { code: "INVALID_INPUT", message: userValidation.error });
        return;
      }

      const nameValidation = validateNickname(nickname);
      if (!nameValidation.valid) {
        socket.emit("ERROR", { code: "INVALID_INPUT", message: nameValidation.error });
        return;
      }

      const cleanNickname = nameValidation.sanitized || nickname;

      // 2. The Auto-Reconnect / Self-Healing Catch
      if (pendingDisconnects.has(userId)) {
        clearTimeout(pendingDisconnects.get(userId));
        pendingDisconnects.delete(userId);
        console.log(`✨ Player ${cleanNickname} (${userId}) returned just in time!`);
      }

      // 3. Locate the Room via the Code
      const roomId = await RedisService.getRoomFromCode(roomCode);
      if (!roomId) {
        socket.emit("ERROR", { code: "ROOM_NOT_FOUND", message: "Room no longer exists" });
        return;
      }

      // 3a. Fetch existing players to detect a mid-game reconnect
      const existingPlayers = await RedisService.getPlayers(roomId);
      const isRejoining = existingPlayers.includes(userId);

      const status = await RedisService.getRoomStatus(roomId);
      if (status !== "WAITING" && !isRejoining) {
        socket.emit("ERROR", { code: "ROOM_NOT_WAITING", message: "Game already in progress" });
        return;
      }

      // 4. Map the new Socket ID to the persistent User ID
      userSocketMap.set(userId, socket.id);

      // 5. Attach state to the socket instance for disconnect handling later
      socket.currentRoom = roomId;
      socket.currentUserId = userId;
      socket.nickname = cleanNickname;
      socket.reconnectRoom = roomId;

      // 6. Physically join the Socket.io room channel
      socket.join(roomId);

      // 7. Persist to Redis
      if (!isRejoining) {
        await RedisService.addPlayer(roomId, userId);
      }
      await RedisService.setPlayerMetadata(roomId, userId, cleanNickname);

      console.log(`✅ ${cleanNickname} (${userId}) boarded Bus: ${roomId}`);

      // 8. Retrieve updated player list for the client
      const updatedPlayers = await RedisService.getPlayersWithNicknames(roomId);
      const hostId = await RedisService.getHost(roomId);
      const formattedPlayers = updatedPlayers.map((p) => ({
        playerId: p.userId,
        nickname: p.nickname,
        isDriver: p.userId === hostId,
      }));

      // 9. Send success back to the joiner
      socket.emit("ROOM_JOINED", {
        roomCode,
        roomId,
        players: formattedPlayers,
        categories: await getCategories(),
      });

      // 10. Broadcast to everyone else in the lobby
      socket.to(roomId).emit("PASSENGER_JOINED", {
        playerId: userId,
        nickname: cleanNickname,
        isDriver: userId === hostId,
        categories: await getCategories(),
      });

    } catch (err: any) {
      console.error("🚨 Boarding Error:", { error: err?.message, code: err?.code });
      socket.emit("ERROR", {
        code: err?.code || "JOIN_ROOM_FAILED",
        message: err?.message || "Could not join the bus.",
      });
    }
  };
};