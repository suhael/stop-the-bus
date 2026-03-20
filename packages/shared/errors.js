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

class NotHostError extends SocketError {
  constructor() {
    super("NOT_HOST", "Only the host can perform this action");
  }
}

class InsufficientPlayersError extends SocketError {
  constructor() {
    super("INSUFFICIENT_PLAYERS", "Need at least 2 players to start the game");
  }
}

class NoLettersAvailableError extends SocketError {
  constructor() {
    super("NO_LETTERS_AVAILABLE", "All letters have been used in this game");
  }
}

class GameAlreadyInProgressError extends SocketError {
  constructor() {
    super("GAME_ALREADY_IN_PROGRESS", "Game is already in progress");
  }
}

module.exports = {
  SocketError,
  RoomNotFoundError,
  RoomNotWaitingError,
  InvalidInputError,
  NicknameTakenError,
  NotHostError,
  InsufficientPlayersError,
  NoLettersAvailableError,
  GameAlreadyInProgressError,
};
