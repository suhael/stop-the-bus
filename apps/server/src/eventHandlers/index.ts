import createRoom from "./createRoom.ts";
import { joinRoom } from "./joinRoom.ts";
import leaveRoom from "./leaveRoom.ts";
import disconnect from "./disconnect.ts";
import startGame from "./startGame.ts";
import stopBus from "./stopBus.ts";
import submitWords from "./submitWords.ts";

/**
 * Register all socket.io event handlers
 */
const registerSocketHandlers = (io: any) => {
  // Global map to track userId -> socket.id for current active connections
  const userSocketMap = new Map<string, string>();

  // Map to track room scoring timeouts - keyed by roomId
  // This survives socket disconnections so room progress isn't blocked
  const roomScoringTimeouts = new Map<string, NodeJS.Timeout>();
  const pendingDisconnects = new Map<string, NodeJS.Timeout>();

  io.on("connection", (socket: any) => {
    console.log(`\n👤 New connection... (Socket ID: ${socket.id})`);

    // Register all event handlers
    socket.on("CREATE_ROOM", createRoom(socket, io, userSocketMap));
    socket.on(
      "JOIN_ROOM",
      joinRoom(socket, io, pendingDisconnects, userSocketMap),
    );
    socket.on(
      "LEAVE_ROOM",
      leaveRoom(socket, io, pendingDisconnects, userSocketMap),
    );
    socket.on("START_GAME", startGame(socket, io));
    socket.on("STOP_CLICKED", stopBus(socket, io, roomScoringTimeouts));
    socket.on("SUBMIT_WORDS", submitWords(socket, io, roomScoringTimeouts));
    socket.on(
      "disconnect",
      disconnect(socket, io, pendingDisconnects, userSocketMap),
    );
  });
};

export default registerSocketHandlers;
