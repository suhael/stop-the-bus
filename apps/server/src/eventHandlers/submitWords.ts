import { RedisService } from "@stop-the-bus/shared/redis";
import roundResults from "./roundResults.ts";
import { client } from "@stop-the-bus/shared/redis/client";

// SUBMIT_WORDS event handler
// payload: { answers: { category1: word1, ... } }
const submitWords = (socket: any, io: any, roomScoringTimeouts: Map<string, any>) => async (payload: any) => {
  try {
    const roomId = socket.currentRoom;
    const userId = socket.currentUserId;
    if (!roomId || !userId) {
      socket.emit("ERROR", { code: "INVALID_STATE", message: "Not in a room" });
      return;
    }
    // Get current round
    const round = await RedisService.getRound(roomId);
    if (!round) {
      socket.emit("ERROR", {
        code: "INVALID_STATE",
        message: "No active round",
      });
      return;
    }
    // Validate payload.answers
    if (
      !payload.answers ||
      typeof payload.answers !== "object" ||
      Object.keys(payload.answers).length === 0
    ) {
      socket.emit("ERROR", {
        code: "INVALID_PAYLOAD",
        message: "No answers submitted.",
      });
      return;
    }
    // Save answers
    await RedisService.savePlayerAnswers(
      roomId,
      parseInt(round, 10),
      userId,
      payload.answers,
    );
    // Check if all players have submitted
    const [players, answers] = await Promise.all([
      RedisService.getPlayers(roomId),
      RedisService.getRoomAnswers(roomId, round),
    ]);
    if (Object.keys(answers).length >= players.length) {
      // Clear the fallback timeout in roomScoringTimeouts since everyone submitted
      if (roomScoringTimeouts && roomScoringTimeouts.has(roomId)) {
        clearTimeout(roomScoringTimeouts.get(roomId));
        roomScoringTimeouts.delete(roomId);
      }

      // 🔥 FIX: Atomic lock (expires in 10s to prevent permanent deadlocks)
      const lockKey = `room:${roomId}:scoring_lock`;
      const lockAcquired = await client.set(lockKey, "locked", { NX: true, EX: 10 });

      if (!lockAcquired) {
        console.log(`[Scoring] Calculation already triggered for ${roomId}, skipping.`);
        return;
      }


      // All players submitted: trigger scoring (emit internal event or call scoring logic)
      // NOTE: In rare cases, two players submitting at the same time may both trigger this event.
      // If you want to guarantee only one scoring trigger, use a Redis lock or status flag here.
      io.to(roomId).emit("ALL_WORDS_SUBMITTED", { round });
      // Execute the scoring logic
      await roundResults(io)(roomId);
    }
    // Optionally: acknowledge submission
    socket.emit("WORDS_SUBMITTED", { round });
  } catch (err: any) {
    console.error("SUBMIT_WORDS error:", err);
    socket.emit("ERROR", {
      code: err?.code || "SUBMIT_WORDS_FAILED",
      message: err?.message || "Could not submit words.",
    });
  }
};

export default submitWords;
