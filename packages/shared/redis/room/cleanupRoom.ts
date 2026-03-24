import { client } from "../client.ts";

// Clean up all player metadata and room keys for a deleted room
// Uses SCAN instead of KEYS to avoid blocking Redis on large datasets
export const cleanupRoom = async (roomId: string): Promise<void> => {
  const keys: string[] = [];
  let cursor = 0;
  const pattern = `room:${roomId}*`;

  // Use SCAN to iteratively find all keys matching pattern
  do {
    const reply = await client.scan(cursor, {
      MATCH: pattern,
    });
    cursor = reply.cursor;
    keys.push(...reply.keys);
  } while (cursor !== 0);

  // Delete all found keys in one operation
  if (keys.length > 0) {
    await client.del(keys);
  }
};
