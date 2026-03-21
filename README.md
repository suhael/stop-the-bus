# stop-the-bus

Phase 4: Integration & E2E Testing
Goal: Tie it all together and simulate a game.

Prompt 4: "Create an E2E test script in apps/server/tests/gameFlow.test.js. Use socket.io-client to create two virtual players. Player 1 should 'JOIN_ROOM', Player 2 should 'JOIN_ROOM'. Simulate Player 1 sending 'START_GAME'. Then simulate Player 2 sending 'STOP_CLICKED'. Verify that both players receive the 'START_SCRAMBLE' event."