/**
 * Custom error types for Stop the Bus Socket.io handlers
 */

class SocketError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "SocketError";
  }
}

class RoomNotFoundError extends SocketError {
  constructor() {
    super("ROOM_NOT_FOUND", "Room not found or invalid room code");
  }
}

class RoomNotWaitingError extends SocketError {
  constructor() {
    super("ROOM_NOT_WAITING", "This room is no longer accepting players");
  }
}

class InvalidInputError extends SocketError {
  constructor(field, reason) {
    super("INVALID_INPUT", `Invalid ${field}: ${reason}`);
  }
}

class NicknameTakenError extends SocketError {
  constructor() {
    super("NICKNAME_TAKEN", "Nickname already taken in this room");
  }
}

module.exports = {
  SocketError,
  RoomNotFoundError,
  RoomNotWaitingError,
  InvalidInputError,
  NicknameTakenError,
};
