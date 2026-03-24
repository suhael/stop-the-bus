import { client } from "../client.ts";

// Remove a player and return the new host if the old one left
export const removePlayer = async (roomId: string, userId: string): Promise<string | null> => {
  const currentHost = await client.hGet(`room:${roomId}`, "host_id");

  // Remove player from the ordered list (using userId)
  await client.lRem(`room:${roomId}:players`, 0, userId);

  // Delete player metadata
  await client.del(`room:${roomId}:player:${userId}`);

  // Get the next person in line
  const nextInLine = await client.lIndex(`room:${roomId}:players`, 0);

  // If the person leaving was the host AND there's someone else left
  if (currentHost === userId && nextInLine) {
    await client.hSet(`room:${roomId}`, "host_id", nextInLine);
    return nextInLine; // New Host ID (userId)
  }

  // If no one is left, return null (caller will cleanup entire room)
  if (!nextInLine) {
    return null; // Signals to caller to cleanup room
  }

  return currentHost ?? null; // Host remains the same
};
