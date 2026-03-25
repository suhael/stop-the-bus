import { RedisService, client } from "@stop-the-bus/shared/redis";
import { calculateScores } from "@stop-the-bus/shared/logic/scoring";

// ROUND_RESULTS event handler (should be called internally, not by client)
// payload: { }
const roundResults = (io: any) => async (roomId: string) => {
  try {
    // 1. Give last-second network packets a moment to finish writing to Redis
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Fetch current round, all answers, players, and room state (for letter and stopClickedBy)
    const round = await RedisService.getRound(roomId);
    const [playerAnswers, players, roomData] = await Promise.all([
      RedisService.getRoomAnswers(roomId, round ?? 1),
      RedisService.getPlayers(roomId),
      client.hGetAll(`room:${roomId}`),
    ]);
    if (!round || !roomData || !roomData.letter)
      throw new Error("Missing round or letter");
    const letter = roomData.letter;
    const speedBonusWinnerId = roomData.stopClickedBy ?? "";
    // 2. Run scoring engine
    const scores = calculateScores(playerAnswers, letter, speedBonusWinnerId);
    // 3. Update each player's total score in Redis
    await Promise.all(
      Object.entries(scores).map(async ([userId, roundScore]) => {
        const metaKey = `room:${roomId}:player:${userId}`;
        await client.hIncrBy(metaKey, "score", roundScore);
      }),
    );
    // 4. Build leaderboard (handle missing metadata gracefully)
    const leaderboard = (
      await Promise.all(
        players.map(async (userId) => {
          const meta = await client.hGetAll(`room:${roomId}:player:${userId}`);
          return {
            userId,
            nickname: meta.nickname || "Unknown",
            score: parseInt(meta.score || "0", 10),
          };
        }),
      )
    ).sort((a, b) => b.score - a.score);
    // 5. Optionally: add shared/unique word breakdown for UI highlighting (future improvement)
    // 6. Broadcast results
    io.to(roomId).emit("ROUND_RESULTS", {
      round: parseInt(round, 10),
      letter,
      scores,
      leaderboard,
      playerAnswers,
      // Optionally: sharedWords, uniqueWords, etc.
    });

    // 7. Transition: NEXT_ROUND_READY or GAME_OVER
    const currentRound = parseInt(round, 10);
    if (currentRound < 5) {
      await RedisService.updateRoomStatus(roomId, "RESULTS_SHOWN");
      io.to(roomId).emit("NEXT_ROUND_READY", { nextRound: currentRound + 1 });
    } else {
      // Final podium: leaderboard is already sorted
      await RedisService.updateRoomStatus(roomId, "GAME_OVER");
      io.to(roomId).emit("GAME_OVER", {
        podium: leaderboard,
        playerAnswers,
        scores,
        round: currentRound,
        letter,
      });
    }
  } catch (err) {
    console.error("ROUND_RESULTS error:", err);
  }
};

export default roundResults;
