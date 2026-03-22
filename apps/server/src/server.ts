import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectRedis } from "@stop-the-bus/shared/redis";
import registerEventHandlers from "./eventHandlers";
import "dotenv/config";

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    // For development: allow all origins
    // For production: use environment variable to restrict to specific domains
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// 1. Startup Logic
const startBus = async () => {
  try {
    if (!process.env.REDIS_URL) {
      console.error(
        `❌ ERROR: Missing required environment variable: REDIS_URL`,
      );
      console.error(`👉 Check your .env file or copy it from .env.example`);
      process.exit(1);
    }

    await connectRedis();

    // 2. Register Socket.io Event Handlers
    registerEventHandlers(io);

    server.listen(PORT, () => {
      console.log(`\n🚌 BUS IS AT THE DEPOT!`);
      console.log(`📡 Listening on port: ${PORT}`);
      console.log(`🔗 Redis connected at: ${process.env.REDIS_URL}`);
      console.log(
        `🔐 CORS allowed origins: ${process.env.ALLOWED_ORIGINS || "* (development)"}`,
      );
      console.log("\n");
    });
  } catch (error) {
    console.error("❌ Failed to start the bus engine:", error);
    process.exit(1);
  }
};

startBus();
