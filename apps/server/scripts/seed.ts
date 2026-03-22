import { createClient } from "redis";
import seedWords from "./seedWords";

async function seed() {
  const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  const connectRedis = async () => {
    if (!client.isOpen) {
      await client.connect();
      console.log("✅ Connected to Redis at:", process.env.REDIS_URL || "redis://localhost:6379");
    }
  };

  await connectRedis();

  // Create a 'Global' test room for dev
  await client.hSet("room:DEV123", {
    host_id: "system_bot",
    status: "WAITING",
    round: "1",
  });

  console.log("✅ Seed complete. Redis is ready.");
  await client.disconnect();

  console.log("📖 Seeding Stop the Bus words to SQLite...");
  seedWords();
}

seed();
