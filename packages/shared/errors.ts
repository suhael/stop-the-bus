/**
 * Custom error types for Stop the Bus Socket.io handlers
 */

export class SocketError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "SocketError";
  }
}

export class RoomNotFoundError extends SocketError {
  constructor() {
    super("ROOM_NOT_FOUND", "Room not found or invalid room code");
  }
}

export class RoomNotWaitingError extends SocketError {
  constructor() {
    super("ROOM_NOT_WAITING", "This room is no longer accepting players");
  }
}

export class InvalidInputError extends SocketError {
  constructor(field: string, reason: string) {
    super("INVALID_INPUT", `Invalid ${field}: ${reason}`);
  }
}

export class NicknameTakenError extends SocketError {
  constructor() {
    super("NICKNAME_TAKEN", "Nickname already taken in this room");
  }
}

export class NotHostError extends SocketError {
  constructor() {
    super("NOT_HOST", "Only the host can perform this action");
  }
}

export class InsufficientPlayersError extends SocketError {
  constructor() {
    super("INSUFFICIENT_PLAYERS", "Need at least 2 players to start the game");
  }
}

export class NoLettersAvailableError extends SocketError {
  constructor() {
    super("NO_LETTERS_AVAILABLE", "All letters have been used in this game");
  }
}

export class GameAlreadyInProgressError extends SocketError {
  constructor() {
    super("GAME_ALREADY_IN_PROGRESS", "Game is already in progress");
  }
}
