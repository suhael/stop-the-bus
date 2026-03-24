# stop-the-bus

Phase 4: Integration & E2E Testing
Goal: Tie it all together and simulate a game.

Prompt 4: "Create an E2E test script in apps/server/tests/gameFlow.test.js. Use socket.io-client to create two virtual players. Player 1 should 'JOIN_ROOM', Player 2 should 'JOIN_ROOM'. Simulate Player 1 sending 'START_GAME'. Then simulate Player 2 sending 'STOP_CLICKED'. Verify that both players receive the 'START_SCRAMBLE' event."

Currently, you might be relying on the default socket.on("EVENT", (data) => ...) syntax.

The Upgrade: To get the full power of TypeScript, you should define your Server-to-Client and Client-to-Server event maps.

interface ClientToServerEvents {
SUBMIT_WORDS: (data: { roomId: string, answers: PlayerAnswers }) => void;
STOP_CLICKED: (roomId: string) => void;
}

interface ServerToClientEvents {
ROUND_RESULTS: (data:cd { leaderboard: any, nextRoundReady: boolean }) => void;
}

we can import these exact interfaces into the mobile app. It will make building the UI infinitely faster because your IDE will autocomplete the expected payloads!
