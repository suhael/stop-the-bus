const createRoom = require("./createRoom");
const joinRoom = require("./joinRoom");
const disconnect = require("./disconnect");

/**
 * Register all socket.io event handlers
 */
const registerSocketHandlers = (io) => {
  // Global map to track userId -> socket.id for current active connections
  const userSocketMap = new Map();

  io.on("connection", (socket) => {
    const pendingDisconnects = new Map();
    console.log(`\n👤 New connection... (Socket ID: ${socket.id})`);

    // Register all event handlers
    socket.on("CREATE_ROOM", createRoom(socket, io, userSocketMap));
    socket.on(
      "JOIN_ROOM",
      joinRoom(socket, io, pendingDisconnects, userSocketMap),
    );
    socket.on(
      "disconnect",
      disconnect(socket, io, pendingDisconnects, userSocketMap),
    );
  });
};

module.exports = registerSocketHandlers;
