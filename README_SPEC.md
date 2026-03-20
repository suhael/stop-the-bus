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

## 3. Core Logic & Flow

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

## 4. Data Structures (Redis)

### Room Hash (`room:[ID]`)

| Field     | Type    | Description                         |
| :-------- | :------ | :---------------------------------- |
| `host_id` | String  | Current Driver ID                   |
| `status`  | String  | WAITING, PLAYING, SCRAMBLE, SCORING |
| `letter`  | String  | Current round letter                |
| `round`   | Integer | 1 through 5                         |

### Player List (`room:[ID]:players`)

- Redis List: `[p1_id, p2_id, p3_id...]` (Maintains join order).

---

## 5. Scoring Algorithm

Points are calculated server-side after the scramble:

- **Unique Word:** 10 points (Valid word, no other player used it).
- **Shared Word:** 5 points (Valid word, used by 2+ players).
- **Speed Bonus:** +3 points (Awarded to the player who triggered the Stop).
- **Invalid/Empty:** 0 points.

---

## 6. UI/UX States

1. **The Depot (Lobby):** Players join via 5-digit ticket code.
2. **The Ride (Gameplay):** 5 cards (Name, Country, Food, Animal, Brand).
3. **The Scramble:** Full-screen 3-second emergency overlay.
4. **The Ticket Reveal (Results):** Category-by-category reveal of all player answers.

---

## 7. Local Development

1. **Start Services:** `npm run redis:up` (Starts Docker Redis).
2. **Seed Data:** `npm run redis:seed`.
3. **Run Server:** `F5` in VS Code or `npm run server:dev`.
4. **Run Mobile:** `npm run mobile:start`.
