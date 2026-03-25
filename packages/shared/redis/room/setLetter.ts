
import { client } from "../client";

// Set the current letter for the round
export const setLetter = async (
  roomId: string,
  letter: string
): Promise<void> => {
  await client.hSet(`room:${roomId}`, "letter", letter);
};
