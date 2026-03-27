import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useGame } from '@/src/context/GameContext';
import JoinRoomForm from '@/src/components/JoinRoomForm';

export default function JoinRoute() {
  const { state } = useGame();
  const initialScreen = useRef(state.screen);

  // Dismiss the modal once the room has been successfully joined (screen changes to LOBBY)
  useEffect(() => {
    if (state.screen !== initialScreen.current && state.screen === 'LOBBY') {
      router.back();
    }
  }, [state.screen]);

  return <JoinRoomForm />;
}
