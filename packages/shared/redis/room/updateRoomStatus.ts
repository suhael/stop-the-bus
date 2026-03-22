
import { client } from "../client";

// Update the room status (WAITING, PLAYING, SCRAMBLE, SCORING)
export const updateRoomStatus = async (
  roomId: string,
  status: string
): Promise<void> => {
  await client.hSet(`room:${roomId}`, "status", status);
};
