const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { connectRedis } = require("@stop-the-bus/shared/redis");
const registerEventHandlers = require("./eventHandlers");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS enabled for local dev
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// 1. Startup Logic
const startBus = async () => {
  try {
    if (!process.env.REDIS_URL) {
      console.error(`❌ ERROR: Missing required environment variable: REDIS_URL`);
      console.error(`👉 Check your .env file or copy it from .env.example`);
      process.exit(1);
    }

    await connectRedis();

    // 2. Register Socket.io Event Handlers
    registerEventHandlers(io);

    server.listen(PORT, () => {
      console.log(`\n🚌 BUS IS AT THE DEPOT!`);
      console.log(`📡 Listening on port: ${PORT}`);
      console.log(`🔗 Redis connected at: ${process.env.REDIS_URL}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start the bus engine:", error);
    process.exit(1);
  }
};

startBus();
