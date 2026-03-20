const { createClient } = require("redis");
require("dotenv").config();

const requiredEnvs = ["REDIS_URL", "PORT"];
requiredEnvs.forEach((name) => {
  if (!process.env[name]) {
    console.error(`❌ ERROR: Missing required environment variable: ${name}`);
    console.error(`👉 Check your .env file or copy it from .env.example`);
    process.exit(1); // Stop the bus before it even leaves the station
  }
});

// Initialize the Redis Client
const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Error handling
client.on("error", (err) => console.error("🚌 Redis Bus Breakdown:", err));

// Connect to the instance
const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("✅ Connected to Redis at:", process.env.REDIS_URL);
  }
};

/**
 * Game Logic Helpers
 */
const RedisService = {
  // Create a new room
  createRoom: async (roomId, hostId) => {
    await client.hSet(`room:${roomId}`, {
      host_id: hostId,
      status: "WAITING",
      round: "1",
      created_at: Date.now(),
    });
    // Add host to the player list (First in = Driver)
    await client.rPush(`room:${roomId}:players`, hostId);
  },

  // Get current host (The Driver)
  getHost: async (roomId) => {
    return await client.hGet(`room:${roomId}`, "host_id");
  },

  // Get all players in order
  getPlayers: async (roomId) => {
    return await client.lRange(`room:${roomId}:players`, 0, -1);
  },
};

module.exports = { client, connectRedis, RedisService };
