import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { connectSocket, getSocket } from '@/src/api/socket';
import {
  generateUserId,
  getNickname,
  getUserId,
  getLastRoomCode,
  setLastRoomCode,
  setNickname as persistNickname,
  setUserId,
} from '@/src/utils/storage';

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
  isConnected: boolean;
  pendingJoin: boolean;
  roomCode: string;
  roomId: string;
  players: Player[];
  categories: string[];
  round: number;
  nextRound: number | null;
  letter: string;
  answers: Record<string, string>;
  error: string | null;
  roundResult: RoundResult | null;
  gameOverData: GameOverData | null;
  scrambleTimeRemaining: number;
  stopClickedBy: string | null;
}

// ─── Initial State & Reducer ──────────────────────────────────────────────────

const initialState: GameState = {
  screen: 'LOADING',
  userId: '',
  nickname: '',
  isConnected: false,
  pendingJoin: false,
  roomCode: '',
  roomId: '',
  players: [],
  categories: [],
  round: 1,
  nextRound: null,
  letter: '',
  answers: {},
  error: null,
  roundResult: null,
  gameOverData: null,
  scrambleTimeRemaining: 0,
  stopClickedBy: null,
};

type GameAction =
  | { type: 'INITIALIZE'; payload: { userId: string; nickname: string; screen: Screen } }
  | { type: 'SET_CONNECTION'; payload: boolean }
  | { type: 'SET_NICKNAME'; payload: string }
  | { type: 'CREATE_ROOM_PENDING' }
  | { type: 'JOIN_ROOM_PENDING'; payload: { roomCode: string } }
  | {
      type: 'ROOM_JOINED';
      payload: { roomCode: string; roomId: string; players: Player[]; categories: string[] };
    }
  | { type: 'PASSENGER_JOINED'; payload: Player & { categories?: string[] } }
  | { type: 'PASSENGER_LEFT'; payload: { playerId: string; newHostId?: string } }
  | { type: 'GAME_STARTED'; payload: { round: number; letter: string } }
  | { type: 'SCRAMBLE_STARTED'; payload: { duration: number; stopClickedBy?: string | null } }
  | { type: 'SCRAMBLE_TICK'; payload: number }
  | { type: 'ROUND_RESULTS'; payload: RoundResult }
  | { type: 'NEXT_ROUND_READY'; payload: { nextRound: number } }
  | { type: 'GAME_OVER'; payload: GameOverData }
  | { type: 'SET_ANSWER'; payload: { category: string; word: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        userId: action.payload.userId,
        nickname: action.payload.nickname,
        screen: action.payload.screen,
      };
    case 'SET_CONNECTION':
      return { ...state, isConnected: action.payload };
    case 'SET_NICKNAME':
      return { ...state, nickname: action.payload, screen: 'HOME' };
    case 'CREATE_ROOM_PENDING':
      return { ...state, pendingJoin: true, error: null };
    case 'JOIN_ROOM_PENDING':
      return { ...state, pendingJoin: true, error: null };
    case 'ROOM_JOINED':
      return {
        ...state,
        roomCode: action.payload.roomCode,
        roomId: action.payload.roomId,
        players: action.payload.players,
        categories: action.payload.categories,
        screen: 'LOBBY',
        pendingJoin: false,
        nextRound: null,
        error: null,
      };
    case 'PASSENGER_JOINED': {
      const existing = state.players.findIndex((p) => p.playerId === action.payload.playerId);
      let newPlayers = [...state.players];
      if (existing >= 0) {
        newPlayers[existing] = {
          playerId: action.payload.playerId,
          nickname: action.payload.nickname,
          isDriver: action.payload.isDriver,
        };
      } else {
        newPlayers.push({
          playerId: action.payload.playerId,
          nickname: action.payload.nickname,
          isDriver: action.payload.isDriver,
        });
      }
      return {
        ...state,
        players: newPlayers,
        categories: action.payload.categories || state.categories,
      };
    }
    case 'PASSENGER_LEFT':
      return {
        ...state,
        players: state.players
          .filter((p) => p.playerId !== action.payload.playerId)
          .map((p) =>
            action.payload.newHostId && p.playerId === action.payload.newHostId
              ? { ...p, isDriver: true }
              : p
          ),
      };
    case 'GAME_STARTED':
      return {
        ...state,
        round: action.payload.round,
        letter: action.payload.letter,
        answers: {}, // Clear answers for the new round
        screen: 'GAMEPLAY',
        roundResult: null,
        gameOverData: null,
        nextRound: null,
        stopClickedBy: null,
      };
    case 'SCRAMBLE_STARTED':
      return {
        ...state,
        screen: 'SCRAMBLE',
        scrambleTimeRemaining: action.payload.duration,
        stopClickedBy: action.payload.stopClickedBy ?? state.stopClickedBy,
      };
    case 'SCRAMBLE_TICK':
      return { ...state, scrambleTimeRemaining: action.payload };
    case 'ROUND_RESULTS':
      return { ...state, screen: 'RESULTS', roundResult: action.payload, stopClickedBy: null };
    case 'NEXT_ROUND_READY':
      return { ...state, nextRound: action.payload.nextRound };
    case 'GAME_OVER':
      return { ...state, screen: 'GAME_OVER', gameOverData: action.payload, nextRound: null };
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.payload.category]: action.payload.word },
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, pendingJoin: false };
    case 'RESET_GAME':
      return {
        ...initialState,
        userId: state.userId,
        nickname: state.nickname,
        isConnected: state.isConnected,
        screen: 'HOME',
      };
    default:
      return state;
  }
}

// ─── Context & Provider ───────────────────────────────────────────────────────

interface GameContextProps {
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

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const stateRef = useRef(state);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 1. Initial Load from Storage
  useEffect(() => {
    const init = async () => {
      let storedUserId = await getUserId();
      if (!storedUserId) {
        storedUserId = generateUserId();
        await setUserId(storedUserId);
      }
      const storedNickname = await getNickname();

      dispatch({
        type: 'INITIALIZE',
        payload: {
          userId: storedUserId,
          nickname: storedNickname || '',
          screen: storedNickname ? 'HOME' : 'NICKNAME',
        },
      });

      // Connect socket globally
      connectSocket();
    };
    init();
  }, []);

  // 2. OS Backgrounding Auto-Reconnect Logic
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[AppState] App returned to foreground. Checking socket...');
        
        const socket = getSocket();
        
        const cachedUserId = await getUserId();
        const cachedNickname = await getNickname();
        const cachedRoomCode = await getLastRoomCode();
        const shouldRejoin =
          cachedUserId && cachedNickname && cachedRoomCode && stateRef.current.screen !== 'HOME';

        if (shouldRejoin) {
          const doRejoin = () => {
            console.log(`[AppState] Reclaiming spot in room ${cachedRoomCode}`);
            socket.emit('JOIN_ROOM', {
              roomCode: cachedRoomCode,
              userId: cachedUserId,
              nickname: cachedNickname,
            });
          };

          if (!socket.connected) {
            // Socket was killed by the OS — wait for handshake before emitting
            console.log('[AppState] Socket dead. Reconnecting then re-joining...');
            socket.once('connect', doRejoin);
            socket.connect();
          } else {
            // Socket auto-reconnected while backgrounded but room membership is lost
            console.log('[AppState] Socket alive but room lost. Re-joining...');
            doRejoin();
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 3. Socket Listeners
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => dispatch({ type: 'SET_CONNECTION', payload: true });
    const onDisconnect = () => dispatch({ type: 'SET_CONNECTION', payload: false });

    const onRoomCreated = async (data: any) => {
      await setLastRoomCode(data.roomCode);
      dispatch({
        type: 'ROOM_JOINED',
        payload: {
          roomCode: data.roomCode,
          roomId: data.roomId,
          players: data.players ?? [],
          categories: data.categories,
        },
      });
    };

    const onRoomJoined = async (data: any) => {
      await setLastRoomCode(data.roomCode);
      dispatch({
        type: 'ROOM_JOINED',
        payload: {
          roomCode: data.roomCode,
          roomId: data.roomId,
          players: data.players,
          categories: data.categories,
        },
      });
    };

    // Fired instead of ROOM_JOINED when returning mid-game so the app never
    // flashes back to the Lobby screen.
    const onGameRejoined = async (data: any) => {
      await setLastRoomCode(data.roomCode);
      // Restore room identity silently
      dispatch({
        type: 'ROOM_JOINED',
        payload: {
          roomCode: data.roomCode,
          roomId: data.roomId,
          players: data.players,
          categories: data.categories,
        },
      });
      // Then immediately jump to the right in-game screen
      dispatch({ type: 'GAME_STARTED', payload: { round: data.round, letter: data.letter } });
      if (data.status === 'SCRAMBLE') {
        dispatch({
          type: 'SCRAMBLE_STARTED',
          payload: { duration: 0, stopClickedBy: data.stopClickedBy ?? null },
        });
      }
    };

    const onPassengerJoined = (data: any) => dispatch({ type: 'PASSENGER_JOINED', payload: data });
    const onPassengerLeft = (data: any) => dispatch({ type: 'PASSENGER_LEFT', payload: data });
    const onGameStarted = (data: any) => dispatch({ type: 'GAME_STARTED', payload: data });
    const onScrambleStarted = (data: any) =>
      dispatch({
        type: 'SCRAMBLE_STARTED',
        payload: {
          duration: data.duration ?? data.timeRemaining ?? 0,
          stopClickedBy: data.stopClickedBy ?? null,
        },
      });
    const onRoundResults = (data: any) => dispatch({ type: 'ROUND_RESULTS', payload: data });
    const onNextRoundReady = (data: any) => dispatch({ type: 'NEXT_ROUND_READY', payload: data });
    const onGameOver = (data: any) => dispatch({ type: 'GAME_OVER', payload: data });
    const onError = (data: any) => dispatch({ type: 'SET_ERROR', payload: data.message });

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ROOM_CREATED', onRoomCreated);
    socket.on('ROOM_JOINED', onRoomJoined);
    socket.on('GAME_REJOINED', onGameRejoined);
    socket.on('PASSENGER_JOINED', onPassengerJoined);
    socket.on('PASSENGER_LEFT', onPassengerLeft);
    socket.on('GAME_STARTED', onGameStarted);
    socket.on('START_SCRAMBLE', onScrambleStarted);
    socket.on('SCRAMBLE_STARTED', onScrambleStarted);
    socket.on('ROUND_RESULTS', onRoundResults);
    socket.on('NEXT_ROUND_READY', onNextRoundReady);
    socket.on('GAME_OVER', onGameOver);
    socket.on('ERROR', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('ROOM_CREATED', onRoomCreated);
      socket.off('ROOM_JOINED', onRoomJoined);
      socket.off('GAME_REJOINED', onGameRejoined);
      socket.off('PASSENGER_JOINED', onPassengerJoined);
      socket.off('PASSENGER_LEFT', onPassengerLeft);
      socket.off('GAME_STARTED', onGameStarted);
      socket.off('START_SCRAMBLE', onScrambleStarted);
      socket.off('SCRAMBLE_STARTED', onScrambleStarted);
      socket.off('ROUND_RESULTS', onRoundResults);
      socket.off('NEXT_ROUND_READY', onNextRoundReady);
      socket.off('GAME_OVER', onGameOver);
      socket.off('ERROR', onError);
    };
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const setNicknameAndProceed = useCallback(async (name: string) => {
    await persistNickname(name);
    dispatch({ type: 'SET_NICKNAME', payload: name });
  }, []);

  const createRoom = useCallback(() => {
    dispatch({ type: 'CREATE_ROOM_PENDING' });
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

export const useGame = (): GameContextProps => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};