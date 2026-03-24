import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@stop_the_bus:userId';
const NICKNAME_KEY = '@stop_the_bus:nickname';
const ROOM_CODE_KEY = '@stop_the_bus:lastRoomCode';

export const getUserId = async (): Promise<string | null> => {
  return AsyncStorage.getItem(USER_ID_KEY);
};

export const setUserId = async (userId: string): Promise<void> => {
  return AsyncStorage.setItem(USER_ID_KEY, userId);
};

export const getNickname = async (): Promise<string | null> => {
  return AsyncStorage.getItem(NICKNAME_KEY);
};

export const setNickname = async (nickname: string): Promise<void> => {
  return AsyncStorage.setItem(NICKNAME_KEY, nickname);
};

export const getLastRoomCode = async (): Promise<string | null> => {
  return AsyncStorage.getItem(ROOM_CODE_KEY);
};

export const setLastRoomCode = async (roomCode: string): Promise<void> => {
  return AsyncStorage.setItem(ROOM_CODE_KEY, roomCode);
};

export const clearSession = async (): Promise<void> => {
  return AsyncStorage.multiRemove([USER_ID_KEY, NICKNAME_KEY, ROOM_CODE_KEY]);
};

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};
