import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useGame } from '@/src/context/GameContext';
import NicknameScreen from '@/src/screens/NicknameScreen';

export default function NicknameRoute() {
  const { state } = useGame();
  const initialNickname = useRef(state.nickname);

  // Dismiss the modal once the user has successfully set a (new) nickname
  useEffect(() => {
    if (state.nickname && state.nickname !== initialNickname.current) {
      router.back();
    }
  }, [state.nickname]);

  return <NicknameScreen />;
}
