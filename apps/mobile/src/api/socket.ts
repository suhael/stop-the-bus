import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';

// ENV is guaranteed non-null here — _layout.tsx gates the app on ENV_ERRORS
// before any screen (and therefore any socket usage) can be reached.
if (!ENV) {
  throw new Error(
    'Socket initialised before environment validation passed. ' +
    'Check ENV_ERRORS in apps/mobile/src/config/env.ts.',
  );
}

const SERVER_URL = ENV.EXPO_PUBLIC_SERVER_URL;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};
