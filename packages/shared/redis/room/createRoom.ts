import { client } from "../client";

// Create a new room
export const createRoom = async (roomId: string, hostId: string, roomCode: string): Promise<void> => {
  // 1. Create the room hash
  await client.hSet(`room:${roomId}`, {
    host_id: hostId,
    status: "WAITING",
    round: "1",
    code: roomCode,
    created_at: Date.now(),
  });

  // 2. Set expiry on room hash (24 hours = 86400 seconds)
  await client.expire(`room:${roomId}`, 86400);

  // 3. Add host to the player list (First in = Driver)
  await client.rPush(`room:${roomId}:players`, hostId);

  // 4. Set expiry on player list (same as room)
  await client.expire(`room:${roomId}:players`, 86400);

  // 5. Initialize usedLetters set with 24h expiry
  await client.expire(`room:${roomId}:usedLetters`, 86400);

  // 6. Store code -> roomId mapping for easy lookup with 24 hour expiry
  await client.set(`code:${roomCode}`, roomId, { EX: 86400 });
};


