import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { connectSocket, getSocket } from '../api/socket';
import {
  generateUserId,
  getNickname,
  getUserId,
  setLastRoomCode,
  setNickname as persistNickname,
  setUserId,
} from '../utils/storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Screen =
  | 'LOADING'
  | 'NICKNAME'
  | 'HOME'
  | 'LOBBY'
  | 'GAMEPLAY'
  | 'SCRAMBLE'
  | 'RESULTS'
  | 'GAME_OVER';

export interface Player {
  playerId: string;
  nickname: string;
  isDriver: boolean;
}

export interface RoundResult {
  round: number;
  letter: string;
  scores: Record<string, number>;
  leaderboard: { userId: string; nickname: string; score: number }[];
  playerAnswers: Record<string, Record<string, string>>;
}

export interface GameOverData {
  podium: { userId: string; nickname: string; score: number }[];
  playerAnswers: Record<string, Record<string, string>>;
  scores: Record<string, number>;
  round: number;
  letter: string;
}

interface GameState {
  screen: Screen;
  userId: string;
  nickname: string;
  roomCode: string;
  roomId: string;
  players: Player[];
  categories: string[];
  round: number;
  letter: string;
  answers: Record<string, string>;
  stopClickedBy: string;
  scrambleTimeRemaining: number;
  roundResult: RoundResult | null;
  nextRound: number;
  gameOver: GameOverData | null;
  error: string | null;
  isConnected: boolean;
  pendingJoin: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'SET_USER'; payload: { userId: string; nickname: string } }
  | {
      type: 'ROOM_CREATED';
      payload: { roomCode: string; roomId: string; categories: string[] };
    }
  | {
      type: 'JOIN_ROOM_PENDING';
      payload: { roomCode: string };
    }
  | {
      type: 'PASSENGER_JOINED';
      payload: {
        playerId: string;
        nickname: string;
        isDriver: boolean;
        categories: string[];
        selfUserId: string;
      };
    }
  | { type: 'HOST_MIGRATED'; payload: { newHostId: string } }
  | {
      type: 'ROUND_START';
      payload: { letter: string; round: number; categories: string[] };
    }
  | {
      type: 'START_SCRAMBLE';
      payload: { timeRemaining: number; stopClickedBy: string };
    }
  | { type: 'ROUND_RESULTS'; payload: RoundResult }
  | { type: 'NEXT_ROUND_READY'; payload: { nextRound: number } }
  | { type: 'GAME_OVER'; payload: GameOverData }
  | { type: 'SET_ANSWER'; payload: { category: string; word: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'RESET_GAME' };

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState: GameState = {
  screen: 'LOADING',
  userId: '',
  nickname: '',
  roomCode: '',
  roomId: '',
  players: [],
  categories: [],
  round: 0,
  letter: '',
  answers: {},
  stopClickedBy: '',
  scrambleTimeRemaining: 3,
  roundResult: null,
  nextRound: 1,
  gameOver: null,
  error: null,
  isConnected: false,
  pendingJoin: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

const IN_GAME_SCREENS: Screen[] = ['GAMEPLAY', 'SCRAMBLE', 'RESULTS', 'GAME_OVER'];

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };

    case 'SET_USER':
      return {
        ...state,
        userId: action.payload.userId,
        nickname: action.payload.nickname,
      };

    case 'ROOM_CREATED':
      return {
        ...state,
        roomCode: action.payload.roomCode,
        roomId: action.payload.roomId,
        categories: action.payload.categories.length
          ? action.payload.categories
          : state.categories,
        players: [],
        screen: 'LOBBY',
        error: null,
        pendingJoin: false,
      };

    case 'JOIN_ROOM_PENDING':
      return {
        ...state,
        roomCode: action.payload.roomCode,
        pendingJoin: true,
        error: null,
      };

    case 'PASSENGER_JOINED': {
      const { playerId, nickname, isDriver, categories, selfUserId } = action.payload;
      const player: Player = { playerId, nickname, isDriver };

      // Update players list
      const existing = state.players.find((p) => p.playerId === playerId);
      const updatedPlayers = existing
        ? state.players.map((p) => (p.playerId === playerId ? player : p))
        : [...state.players, player];

      // Determine if we should navigate to lobby
      const isSelf = playerId === selfUserId;
      const notInGame = !IN_GAME_SCREENS.includes(state.screen);
      const navigateToLobby = isSelf && notInGame;

      return {
        ...state,
        players: updatedPlayers,
        categories: categories?.length ? categories : state.categories,
        pendingJoin: false,
        screen: navigateToLobby ? 'LOBBY' : state.screen,
        error: null,
      };
    }

    case 'HOST_MIGRATED':
      return {
        ...state,
        players: state.players.map((p) => ({
          ...p,
          isDriver: p.playerId === action.payload.newHostId,
        })),
      };

    case 'ROUND_START':
      return {
        ...state,
        letter: action.payload.letter,
        round: action.payload.round,
        categories: action.payload.categories,
        answers: {},
        screen: 'GAMEPLAY',
        error: null,
      };

    case 'START_SCRAMBLE':
      return {
        ...state,
        scrambleTimeRemaining: action.payload.timeRemaining,
        stopClickedBy: action.payload.stopClickedBy,
        screen: 'SCRAMBLE',
      };

    case 'ROUND_RESULTS':
      return {
        ...state,
        roundResult: action.payload,
        screen: 'RESULTS',
      };

    case 'NEXT_ROUND_READY':
      return { ...state, nextRound: action.payload.nextRound };

    case 'GAME_OVER':
      return { ...state, gameOver: action.payload, screen: 'GAME_OVER' };

    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.payload.category]: action.payload.word },
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };

    case 'RESET_GAME':
      return {
        ...initialState,
        userId: state.userId,
        nickname: state.nickname,
        screen: 'HOME',
        isConnected: state.isConnected,
      };

    default:
      return state;
  }
}

// ─── Context & Provider ───────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  startGame: () => void;
  stopBus: () => void;
  submitWords: () => void;
  setAnswer: (category: string, word: string) => void;
  setError: (error: string | null) => void;
  setNicknameAndProceed: (nickname: string) => Promise<void>;
  resetGame: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Always keep a ref to avoid stale closures in socket event handlers
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Init: restore session from AsyncStorage ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      let userId = await getUserId();
      if (!userId) {
        userId = generateUserId();
        await setUserId(userId);
      }
      const savedNickname = await getNickname();
      dispatch({ type: 'SET_USER', payload: { userId, nickname: savedNickname ?? '' } });
      dispatch({
        type: 'SET_SCREEN',
        payload: savedNickname ? 'HOME' : 'NICKNAME',
      });
    };
    init();
  }, []);

  // ── Socket: connect and register all listeners ───────────────────────────
  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    socket.on(
      'ROOM_CREATED',
      (data: { roomCode: string; roomId: string; categories: string[] }) => {
        setLastRoomCode(data.roomCode);
        dispatch({ type: 'ROOM_CREATED', payload: data });
      },
    );

    socket.on(
      'PASSENGER_JOINED',
      (data: {
        playerId: string;
        nickname: string;
        isDriver: boolean;
        categories: string[];
      }) => {
        dispatch({
          type: 'PASSENGER_JOINED',
          payload: { ...data, selfUserId: stateRef.current.userId },
        });
      },
    );

    socket.on('HOST_MIGRATED', (data: { newHostId: string }) => {
      dispatch({ type: 'HOST_MIGRATED', payload: data });
    });

    socket.on(
      'ROUND_START',
      (data: { letter: string; round: number; categories: string[] }) => {
        dispatch({ type: 'ROUND_START', payload: data });
      },
    );

    socket.on(
      'START_SCRAMBLE',
      (data: { timeRemaining: number; stopClickedBy: string }) => {
        dispatch({ type: 'START_SCRAMBLE', payload: data });
      },
    );

    socket.on('ROUND_RESULTS', (data: RoundResult) => {
      dispatch({ type: 'ROUND_RESULTS', payload: data });
    });

    socket.on('NEXT_ROUND_READY', (data: { nextRound: number }) => {
      dispatch({ type: 'NEXT_ROUND_READY', payload: data });
    });

    socket.on('GAME_OVER', (data: GameOverData) => {
      dispatch({ type: 'GAME_OVER', payload: data });
    });

    socket.on('ERROR', (data: { code: string; message: string }) => {
      dispatch({ type: 'SET_ERROR', payload: data.message });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('ROOM_CREATED');
      socket.off('PASSENGER_JOINED');
      socket.off('HOST_MIGRATED');
      socket.off('ROUND_START');
      socket.off('START_SCRAMBLE');
      socket.off('ROUND_RESULTS');
      socket.off('NEXT_ROUND_READY');
      socket.off('GAME_OVER');
      socket.off('ERROR');
    };
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const setNicknameAndProceed = useCallback(async (nickname: string) => {
    await persistNickname(nickname);
    dispatch({
      type: 'SET_USER',
      payload: { userId: stateRef.current.userId, nickname },
    });
    dispatch({ type: 'SET_SCREEN', payload: 'HOME' });
  }, []);

  const createRoom = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
    getSocket().emit('CREATE_ROOM', {
      userId: stateRef.current.userId,
      nickname: stateRef.current.nickname,
    });
  }, []);

  const joinRoom = useCallback((roomCode: string) => {
    const code = roomCode.toUpperCase().trim();
    dispatch({ type: 'JOIN_ROOM_PENDING', payload: { roomCode: code } });
    getSocket().emit('JOIN_ROOM', {
      roomCode: code,
      userId: stateRef.current.userId,
      nickname: stateRef.current.nickname,
    });
  }, []);

  const startGame = useCallback(() => {
    getSocket().emit('START_GAME');
  }, []);

  const stopBus = useCallback(() => {
    getSocket().emit('STOP_CLICKED');
  }, []);

  const submitWords = useCallback(() => {
    getSocket().emit('SUBMIT_WORDS', { answers: stateRef.current.answers });
  }, []);

  const setAnswer = useCallback((category: string, word: string) => {
    dispatch({ type: 'SET_ANSWER', payload: { category, word } });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        createRoom,
        joinRoom,
        startGame,
        stopBus,
        submitWords,
        setAnswer,
        setError,
        setNicknameAndProceed,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};
