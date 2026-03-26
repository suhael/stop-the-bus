# 🚌 Stop the Bus: The Word Game - Technical Specification

## 1. Project Overview

"Stop the Bus" is a high-speed, multiplayer category word game. Players compete to fill 5 categories starting with a specific letter. The round ends when a player completes all categories and "Stops the Bus," triggering a 3-second scramble for all other passengers.

### Key Pillars:

- **Client-Heavy Validation:** Words are validated locally via SQLite to ensure instant UI feedback.
- **Server-Light Orchestration:** Node.js/Socket.io handles timing, room state, and final scoring.
- **Ephemeral State:** Redis stores active game sessions; no persistent user DB for MVP.

---

## 2. Technical Stack

- **Monorepo:** npm workspaces.
- **Frontend:** React Native (Expo) + SQLite (Local Dictionary).
- **Backend:** Node.js + Socket.io.
- **State/Cache:** Redis (Running in Docker for local dev).
- **Infrastructure:** Google Cloud Run (Server) + Redis Cloud.

---

## 3. System Architecture

- **Monorepo:** npm workspaces (`apps/server`, `packages/shared`).
- **Real-time:** Node.js + Socket.io.
- **State Management:** Redis (Lists for player order, Hashes for room state).
- **Logic:** Centralized in `packages/shared` for testability.

---

## 4. Core Logic & Flow

### A. The "On Blur" Validation

Validation occurs when a user navigates away from an input field (`OnBlur`).

- **Query:** `SELECT 1 FROM [category] WHERE letter = 'X' AND word = 'Word' COLLATE NOCASE LIMIT 1;`
- **UI State:** Field turns **Green** (Valid) or **Red** (Invalid).
- **Stop Trigger:** The "Stop" button only unlocks when all 5 fields are **Green**.

### B. The 3-Second Scramble

1. Player A hits **STOP**.
2. Server receives `EVENT_STOP_CLICKED`.
3. Server broadcasts `EVENT_START_SCRAMBLE` to all clients.
4. Clients show a 3-second visual countdown.
5. At T-minus 0, clients force-emit current word values to the Server.

### C. Host Migration ("The Driver")

- Players are stored in a Redis List: `room:[ID]:players`.
- If the `host_id` disconnects, the Server promotes the next ID in the List.
- New host receives "Start Game" permissions.

---

## 5. Data Structures (Redis)

### Room Hash (`room:[ID]`)

| Field     | Type    | Description                         |
| :-------- | :------ | :---------------------------------- |
| `host_id` | String  | Current Driver ID (userId)          |
| `status`  | String  | WAITING, PLAYING, SCRAMBLE, SCORING |
| `letter`  | String  | Current round letter                |
| `round`   | Integer | 1 through 5                         |
| `code`    | String  | 5-digit room code                   |

### Room State Schema (Redis)

- `room:[ID]` (Hash): Main room state (with auto-expiry: 24h)
  - `host_id`: userId of the driver.
  - `status`: `WAITING`, `PLAYING`, `SCRAMBLE`, `SCORING`.
  - `letter`: The char for the current round.
  - `round`: Current round number (1-5).
  - `code`: 5-digit room code.
- `room:[ID]:players` (List): Ordered list of userIds. (with auto-expiry: 24h)
- `room:[ID]:player:[userId]` (Hash): Player metadata
  - `nickname`: Player's nickname
  - `joinedAt`: Timestamp when player joined
- `code:[ROOMCODE]` (String): Mapping to roomId for quick lookup (with auto-expiry: 24h)
- `room:[ID]:answers:[round]` (Hash): `{ [userId]: JSON_STRING_OF_ANSWERS }`

### Player List (`room:[ID]:players`)

- Redis List: `[userId1, userId2, userId3...]` (Maintains join order by userId, not socket.id)

---

## 6. Comprehensive Event List

| Event                  | Direction | Payload                                | Description                                     |
| :--------------------- | :-------- | :------------------------------------- | :---------------------------------------------- |
| **CREATE_ROOM**        | C -> S    | `{ userId, nickname }`                 | Creates a new room, receives room code.         |
| **ROOM_CREATED**       | S -> C    | `{ roomCode, roomId }`                 | Sent to host with the room code to share.       |
| **JOIN_ROOM**          | C -> S    | `{ roomCode, userId, nickname }`       | Joins room by code, triggers validation.        |
| **PASSENGER_JOINED**   | S -> R    | `{ playerId, nickname, isDriver }`     | Broadcast to room on successful join.           |
| **PLAYER_RECONNECTED** | S -> R    | `{ playerId }`                         | Player reconnected within 5s grace period.      |
| **HOST_MIGRATED**      | S -> R    | `{ newHostId }`                        | Triggered after 5s grace period if host leaves. |
| **ERROR**              | S -> C    | `{ code, message }`                    | Error response with error code and message.     |
| **START_GAME**         | C -> S    | `null`                                 | Host only. Transitions room to `PLAYING`.       |
| **ROUND_START**        | S -> R    | `{ letter, round }`                    | Sends random letter; starts client timers.      |
| **STOP_CLICKED**       | C -> S    | `null`                                 | First player to finish hits this.               |
| **START_SCRAMBLE**     | S -> R    | `{ timeRemaining: 3 }`                 | Global 3s countdown for all other players.      |
| **SUBMIT_WORDS**       | C -> S    | `{ words: { category: word } }`        | Clients auto-emit when scramble hits 0.         |
| **ROUND_RESULTS**      | S -> R    | `{ scores: {}, nextRoundReady: bool }` | Calculation of unique/shared words.             |
| **GAME_OVER**          | S -> R    | `{ podium: [] }`                       | Final scores after 5 rounds.                    |

---

## 7. Scoring Algorithm

Points are calculated server-side after the scramble:

- **Valid & Unique:** 10 points (No other player used this word).
- **Valid & Shared:** 5 points (Used by 2 or more players).
- **Speed Bonus:** +3 points to the player who emitted `STOP_CLICKED`.
- **Invalid/Empty:** 0 points.
- _Note: Validation uses SQLite 'game.db' on the Mobile side, but the Server performs the final cross-reference check._

---

## 8. UI/UX States

1. **The Depot (Lobby):** Players join via 5-digit ticket code.
2. **The Ride (Gameplay):** 5 cards (Name, Country, Food, Animal, Brand).
3. **The Scramble:** Full-screen 3-second emergency overlay.
4. **The Ticket Reveal (Results):** Category-by-category reveal of all player answers.

---

## 9. Local Development

1. **Start Services:** `npm run redis:up` (Starts Docker Redis).
2. **Seed Data:** `npm run redis:seed`.
3. **Run Server:** `F5` in VS Code or `npm run server:dev`.
4. **Run Mobile:** `npm run mobile:start`.

---

## 10. Testing Strategy

- **Unit Tests:** Test the `scoring.js` logic in `packages/shared` using Vitest/Jest.
- **E2E Tests:** Use `socket.io-client` in a test script to simulate 2-3 virtual players joining, playing a round, and verifying the score.
