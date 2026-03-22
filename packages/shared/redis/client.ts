import { createClient } from "redis";
import "dotenv/config";

if (!process.env.REDIS_URL) {
  throw new Error(
    "Missing required environment variable: REDIS_URL. Check your .env file or copy it from .env.example"
  );
}

// Initialize the Redis Client
export const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Error handling
client.on("error", (err: Error) => console.error("🚌 Redis Bus Breakdown:", err));

// Connect to the instance
export const connectRedis = async (): Promise<void> => {
  if (!client.isOpen) {
    await client.connect();
    console.log("✅ Connected to Redis at:", process.env.REDIS_URL);
  }
};
