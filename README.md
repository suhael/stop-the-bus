# stop-the-bus

Phase 1: Game State & Room Orchestration
Goal: Handle the transition from Lobby to "Starting the Game."

Prompt 1: "Referencing README_SPEC.md, create apps/server/src/eventHandlers/startGame.js. It should: 1. Verify the requester is the host_id in Redis. 2. Select a random letter (A-Z) that hasn't been used yet this game. 3. Update the Redis room status to PLAYING. 4. Emit ROUND_START to the room with the letter and round number. Update the eventHandlers/index.js to register this."

Phase 2: The Scramble Mechanism (Concurrency)
Goal: Handle the "Stop the Bus" moment and the 3-second timer.

Prompt 2: "Create apps/server/src/eventHandlers/stopBus.js. When a player emits STOP_CLICKED: 1. Check if the room status is PLAYING. 2. Immediately change status to SCRAMBLE. 3. Emit START_SCRAMBLE with a 3-second duration. 4. Set a server-side setTimeout for 3.5 seconds that will trigger the 'Scoring Phase' even if some clients fail to emit their words."

Phase 3: Shared Scoring Logic (The "Brain")
Goal: Build the math without the server. This is where we add Unit Tests.

Prompt 3: "In packages/shared/logic/scoring.js, write a function calculateScores(playerAnswers, speedBonusWinnerId). It should take an object of player IDs and their words, identify which words are unique or shared, and return a point total for each player. Also, create a test file packages/shared/logic/scoring.test.js using Vitest to verify: 1. Unique words = 10pts. 2. Shared words = 5pts. 3. Speed bonus is applied correctly."

Phase 4: Integration & E2E Testing
Goal: Tie it all together and simulate a game.

Prompt 4: "Create an E2E test script in apps/server/tests/gameFlow.test.js. Use socket.io-client to create two virtual players. Player 1 should 'JOIN_ROOM', Player 2 should 'JOIN_ROOM'. Simulate Player 1 sending 'START_GAME'. Then simulate Player 2 sending 'STOP_CLICKED'. Verify that both players receive the 'START_SCRAMBLE' event."
