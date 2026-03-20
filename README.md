# stop-the-bus

Phase 4: Integration & E2E Testing
Goal: Tie it all together and simulate a game.

Prompt 4: "Create an E2E test script in apps/server/tests/gameFlow.test.js. Use socket.io-client to create two virtual players. Player 1 should 'JOIN_ROOM', Player 2 should 'JOIN_ROOM'. Simulate Player 1 sending 'START_GAME'. Then simulate Player 2 sending 'STOP_CLICKED'. Verify that both players receive the 'START_SCRAMBLE' event."

Critical Bug 1: The "Sabotage Disconnect" (Room Freezing)Location: apps/server/src/eventHandlers/stopBus.js and disconnect.js

The Bug:
In stopBus.js, when a player stops the bus, you start a 3.5-second timeout to transition the room to the SCORING phase and attach this timeout to the player's socket (socket.scoringTimeout = scoringTimeoutId).
In disconnect.js, if a player disconnects, you explicitly clear this timeout (clearTimeout(socket.scoringTimeout)).If the player who clicks "STOP" accidentally disconnects (or maliciously closes their app) during that 3.5-second window, the timeout is destroyed. The room will be permanently stuck in the SCRAMBLE status, and the scoring phase will never begin for the other players.

shoukd The scramble timer belongs to the Room, not the Socket. The game must progress to scoring regardless of who disconnects.

Critical Bug 2: The "Zebra Exploit" (Missing Letter Validation)Location: packages/shared/logic/scoring.js

The Bug:
The game "Stop the Bus" requires words to start with the active letter for the round. However, your calculateScores function signature is (playerAnswers, speedBonusWinnerId). It never accepts the currentLetter as an argument, nor does it validate that the words start with the correct letter.Currently, if the round letter is "A", a player can submit "Zebra" for Animal, and the engine will award them 10 points simply because it's a unique string.

should we Pass the letter into the function and validate it in the first pass

Major Logic Flaw: Cross-Category Penalties

Location: packages/shared/logic/scoring.js

The Bug:
You are building a single wordFrequency dictionary for the entire game board.
If Player A submits "Apple" for the Name category, and Player B submits "Apple" for the Fruit category, your logic will group them together in wordFrequency["apple"]. Both players will receive 5 points instead of 10. In traditional Scattergories/Stop the Bus rules, uniqueness is evaluated per category.

we should Nest your frequency dictionary by category.

Room Code Race Condition: In createRoom.js, you check if a code exists (await client.exists) and then later create it. In a highly concurrent environment, two hosts could generate the same code at the exact same millisecond, pass the exists check, and overwrite each other.

For a bulletproof backend, should we use Redis SETNX (Set if Not eXists) when creating the code mapping to ensure atomic creation.
