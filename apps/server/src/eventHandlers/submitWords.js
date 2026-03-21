const { RedisService } = require("@stop-the-bus/shared/redis");

// SUBMIT_WORDS event handler
// payload: { answers: { category1: word1, ... } }
const submitWords = (socket, io) => async (payload) => {
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
      round,
      userId,
      payload.answers,
    );
    // Check if all players have submitted
    const [players, answers] = await Promise.all([
      RedisService.getPlayers(roomId),
      RedisService.getRoomAnswers(roomId, round),
    ]);
    if (Object.keys(answers).length >= players.length) {
      // All players submitted: trigger scoring (emit internal event or call scoring logic)
      // NOTE: In rare cases, two players submitting at the same time may both trigger this event.
      // If you want to guarantee only one scoring trigger, use a Redis lock or status flag here.
      io.to(roomId).emit("ALL_WORDS_SUBMITTED", { round });
      // (Scoring logic will be handled by ROUND_RESULTS handler)
    }
    // Optionally: acknowledge submission
    socket.emit("WORDS_SUBMITTED", { round });
  } catch (err) {
    console.error("SUBMIT_WORDS error:", err);
    socket.emit("ERROR", {
      code: err.code || "SUBMIT_WORDS_FAILED",
      message: err.message || "Could not submit words.",
    });
  }
};

module.exports = submitWords;
