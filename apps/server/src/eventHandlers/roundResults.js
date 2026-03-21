const { RedisService } = require("@stop-the-bus/shared/redis");
const { calculateScores } = require("@stop-the-bus/shared/logic/scoring");

// ROUND_RESULTS event handler (should be called internally, not by client)
// payload: { }
const roundResults = (io) => async (roomId) => {
  try {
    // 1. Fetch current round, all answers, players, and room state (for letter and stopClickedBy)
    const [round, playerAnswers, players, room] = await Promise.all([
      RedisService.getRound(roomId),
      RedisService.getRoomAnswers(roomId, await RedisService.getRound(roomId)),
      RedisService.getPlayers(roomId),
      RedisService.getRoomFromCode(roomId),
    ]);
    if (!round || !room || !room.letter)
      throw new Error("Missing round or letter");
    const letter = room.letter;
    const speedBonusWinnerId = room.stopClickedBy;
    // 2. Run scoring engine
    const scores = calculateScores(playerAnswers, letter, speedBonusWinnerId);
    // 3. Update each player's total score in Redis
    await Promise.all(
      Object.entries(scores).map(async ([userId, roundScore]) => {
        const metaKey = `room:${roomId}:player:${userId}`;
        await RedisService.client.hIncrBy(metaKey, "score", roundScore);
      }),
    );
    // 4. Build leaderboard (handle missing metadata gracefully)
    const leaderboard = [];
    for (const userId of players) {
      const meta = await RedisService.client.hGetAll(
        `room:${roomId}:player:${userId}`,
      );
      leaderboard.push({
        userId,
        nickname: meta.nickname || "Unknown",
        score: parseInt(meta.score || 0, 10),
      });
    }
    leaderboard.sort((a, b) => b.score - a.score);
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
      // Set room status to RESULTS_SHOWN for a pause before next round
      let tries = 0,
        success = false;
      while (!success && tries < 3) {
        try {
          await RedisService.updateRoomStatus(roomId, "RESULTS_SHOWN");
          success = true;
        } catch (err) {
          tries++;
          if (tries >= 3)
            console.error("Failed to update room status after 3 tries", err);
        }
      }
      // UI will trigger next round after 3s countdown via a separate event (e.g., START_NEXT_ROUND)
      io.to(roomId).emit("NEXT_ROUND_READY", { nextRound: currentRound + 1 });
    } else {
      // Final podium: leaderboard is already sorted
      let tries = 0,
        success = false;
      while (!success && tries < 3) {
        try {
          io.to(roomId).emit("GAME_OVER", {
            podium: leaderboard,
            playerAnswers,
            scores,
            round: currentRound,
            letter,
          });
          success = true;
        } catch (err) {
          tries++;
          if (tries >= 3)
            console.error("Failed to emit GAME_OVER after 3 tries", err);
        }
      }
    }
  } catch (err) {
    console.error("ROUND_RESULTS error:", err);
  }
};

module.exports = roundResults;
