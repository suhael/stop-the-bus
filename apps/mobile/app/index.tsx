import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useGame } from "@/src/context/GameContext";
import { Colors } from "@/src/theme";
import NicknameScreen from "@/src/screens/NicknameScreen";
import HomeScreen from "@/src/screens/HomeScreen";
import LobbyScreen from "@/src/screens/LobbyScreen";
import GameplayScreen from "@/src/screens/GameplayScreen";
import ResultsScreen from "@/src/screens/ResultsScreen";
import GameOverScreen from "@/src/screens/GameOverScreen";
import StartScreen from "@/src/screens/StartScreen";

export default function Index() {
  const { state } = useGame();

  switch (state.screen) {
    case "LOADING":
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    case "STARTGAME":
      return <StartScreen />;
    case "NICKNAME":
      return <NicknameScreen />;
    case "HOME":
      return <HomeScreen />;
    case "LOBBY":
      return <LobbyScreen />;
    case "GAMEPLAY":
    case "SCRAMBLE": // Scramble is now an in-place overlay on the gameplay screen
      return <GameplayScreen />;
    case "RESULTS":
      return <ResultsScreen />;
    case "GAME_OVER":
      return <GameOverScreen />;
    default:
      return <HomeScreen />;
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
