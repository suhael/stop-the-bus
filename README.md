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

C. The OS Backgrounding Disconnect (GameContext.tsx)
Mobile operating systems are aggressive. If a user swipes out of your app to reply to a text, iOS/Android will often instantly sever the WebSocket connection to save battery.

The Risk: When they return 3 seconds later, the socket connects with a new socket ID, but your frontend doesn't automatically tell the server "I'm back!"

The Fix: Use React Native's AppState API to detect when the app returns to the active state. When it does, check if the socket is disconnected and immediately emit your IDENTIFY or RECONNECT event using the userId saved in AsyncStorage. This perfectly hooks into the 5-second Grace Period you built on the backend!

🎨 2. UX & Architecture Improvements
A. The "Keyboard Covering the Stop Button" Problem
During the gameplay phase, players are furiously typing words into 5 separate text inputs.

The UX Flaw: When the virtual keyboard pops up, it will likely cover the lower input fields and the crucial "Stop the Bus" button.

The Fix: Wrap your GameplayScreen in a KeyboardAvoidingView and a ScrollView.

TypeScript
<KeyboardAvoidingView
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
style={{ flex: 1 }}

>   <ScrollView keyboardShouldPersistTaps="handled">

     {/* Category Inputs & Stop Button Here */}

  </ScrollView>
</KeyboardAvoidingView>
Note: keyboardShouldPersistTaps="handled" ensures that if they tap the "Stop" button while the keyboard is open, it registe rs the tap instantly instead of just dismissing the keyboard.
