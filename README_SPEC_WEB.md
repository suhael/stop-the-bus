# 🌐 Stop the Bus: Web App Requirements

## 1. Overview

- Multiplayer real-time word game client for browsers (React or similar).
- Connects to backend via Socket.io.
- Supports room creation, joining, gameplay, scoring, and host migration.

## 2. Core Features

- **Authentication:**
  - Enter nickname (no persistent login required).
- **Lobby/Room Flow:**
  - Create or join a room via code.
  - See list of players and host indicator.
  - Host can start the game.
  - Host migration: UI updates if host changes.
- **Gameplay:**
  - Display current round, letter, and categories.
  - Input fields for each category (with local validation/feedback).
  - "Stop the Bus" button enabled only when all fields are valid.
  - 3-second scramble phase after STOP is pressed.
  - Auto-submit words if timer expires.
- **Scoring & Results:**
  - Show round results: who got 10/5/0 per word, highlight shared/unique.
  - Show leaderboard after each round.
  - Show final podium and all answers at game end.
- **Transitions:**
  - Results screen with 3s countdown before next round.
  - UI triggers next round after countdown (host only).
- **Reconnection:**
  - Graceful handling of disconnects/reconnects.
  - UI updates if host migrates or player rejoins.

## 3. Socket.io Events

- CREATE_ROOM / ROOM_CREATED
- JOIN_ROOM / PASSENGER_JOINED
- START_GAME
- STOP_CLICKED / START_SCRAMBLE
- SUBMIT_WORDS / WORDS_SUBMITTED
- ROUND_RESULTS
- NEXT_ROUND_READY
- GAME_OVER
- HOST_MIGRATED
- DISCONNECT/RECONNECT

## 4. UI/UX

- Responsive, accessible design for desktop and mobile browsers.
- Visual feedback for valid/invalid words.
- Animated countdowns and transitions.
- Clear indication of host, round, and game state.

## 5. Edge Cases

- Handle host migration and player disconnects.
- Prevent duplicate room codes or invalid joins.
- Show error messages for network/server issues.

## 6. Tech Stack

- React (or similar web framework)
- socket.io-client
- Optional: Local word validation for instant feedback

---

This spec ensures full compatibility with the backend and a smooth web experience.
