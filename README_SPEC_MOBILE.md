# 📱 Stop the Bus: Mobile App Requirements (Expo/React Native)

## 1. Overview

- Multiplayer real-time word game client for iOS/Android (Expo/React Native).
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

- Responsive, touch-friendly design.
- Visual feedback for valid/invalid words.
- Animated countdowns and transitions.
- Clear indication of host, round, and game state.

## 5. Edge Cases

- Handle host migration and player disconnects.
- Prevent duplicate room codes or invalid joins.
- Show error messages for network/server issues.

## 6. Tech Stack

- Expo (React Native)
- TypeScript
- socket.io-client
- Local SQLite (`expo-sqlite`)
- `expo-asset` (for bundling the dictionary)
- `@react-native-async-storage/async-storage` (for session persistence)

---

## 7. Architecture & State Management

The mobile app relies on handling three distinct types of state to ensure a smooth, lag-free experience while maintaining server authority:

1. **Server State (Socket.io):** Real-time events orchestrated by the backend (e.g., lobby updates, remote scramble timers, official round results).
2. **Local Knowledge (SQLite):** A bundled `game.db` file used strictly for instant "On Blur" validation, providing zero-latency UI feedback (Green/Red inputs) without waiting for network requests.
3. **Global UI State:** React Context/State tracking the current active screen, the player's nickname, local timer visualizations, and the persistent `userId`.

## 8. Folder Layout

To keep the monorepo clean and the app modular, the Expo project (`apps/mobile`) follows this structure:

```text
apps/mobile/
├── assets/
│   └── game.db           <-- Copied from backend for "Double-Check" validation
├── src/
│   ├── api/               <-- Socket.io initialization & event listeners
│   ├── components/        <-- Reusable UI (CategoryInput, BusTimer, PlayerCard)
│   ├── context/           <-- React Contexts (SocketProvider, GameProvider)
│   ├── db/                <-- SQLite setup, asset copying, and query logic
│   ├── hooks/             <-- Custom hooks (useSocket, useGameLoop, useValidation)
│   ├── screens/           <-- Main views (Lobby, Gameplay, Scramble, Results)
│   ├── theme/             <-- Colors, spacing, and typography
│   └── utils/             <-- Helpers (AsyncStorage wrappers, string formatters)
├── App.tsx                <-- Entry point with Context Providers
├── metro.config.js        <-- Custom config to resolve monorepo workspaces
└── app.json               <-- Expo configuration
```
