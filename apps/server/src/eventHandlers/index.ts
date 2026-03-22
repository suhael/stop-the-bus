import createRoom from "./createRoom";
import joinRoom from "./joinRoom";
import disconnect from "./disconnect";
import startGame from "./startGame";
import stopBus from "./stopBus";
import submitWords from "./submitWords";

/**
 * Register all socket.io event handlers
 */
const registerSocketHandlers = (io: any) => {
  // Global map to track userId -> socket.id for current active connections
  const userSocketMap = new Map();

  // Map to track room scoring timeouts - keyed by roomId
  // This survives socket disconnections so room progress isn't blocked
  const roomScoringTimeouts = new Map();

  io.on("connection", (socket: any) => {
    const pendingDisconnects = new Map();
    console.log(`\n👤 New connection... (Socket ID: ${socket.id})`);

    // Register all event handlers
    socket.on("CREATE_ROOM", createRoom(socket, io, userSocketMap));
    socket.on(
      "JOIN_ROOM",
      joinRoom(socket, io, pendingDisconnects, userSocketMap),
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
