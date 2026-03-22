// Look up roomId for a user (useful for reconnection)
export const getRoomIdForUser = async (_userId: string): Promise<string | null> => {
  // This would require scanning rooms - simpler approach is to store it separately
  // For now, clients should provide roomCode on reconnect
  return null; // TODO: Implement if needed
};
