const { createClient } = require("redis");
require("dotenv").config();

if (!process.env.REDIS_URL) {
  throw new Error(
    "Missing required environment variable: REDIS_URL. Check your .env file or copy it from .env.example"
  );
}

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

module.exports = { client, connectRedis };
