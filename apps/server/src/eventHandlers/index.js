const createRoom = require("./createRoom");
const joinRoom = require("./joinRoom");
const disconnect = require("./disconnect");

/**
 * Register all socket.io event handlers
 */
const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const pendingDisconnects = new Map();
    console.log(`\n👤 New Passenger attempting to board... (ID: ${socket.id})`);

    // Register all event handlers
    socket.on("CREATE_ROOM", createRoom(socket, io));
    socket.on("JOIN_ROOM", joinRoom(socket, io, pendingDisconnects));
    socket.on("disconnect", disconnect(socket, io, pendingDisconnects));
  });
};

module.exports = registerSocketHandlers;
