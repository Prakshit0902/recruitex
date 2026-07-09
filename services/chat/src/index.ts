import app from "./app.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { sql } from "./utils/db.js";
import { connectKafka } from "./producer.js";
import { setupSocket } from "./socket/handlers.js";

dotenv.config();

// Connect Kafka producer for offline email notifications
connectKafka();

// Create HTTP server from Express app (needed for Socket.IO)
const httpServer = createServer(app);

// Initialize Socket.IO with CORS config
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Setup socket event handlers
setupSocket(io);

const PORT = process.env.PORT || 5007;
httpServer.listen(PORT, () => {
    console.log(
        `🚀 Chat service is running on http://localhost:${PORT}`
    );
    console.log(`🔌 WebSocket server ready`);
});

export { io };
