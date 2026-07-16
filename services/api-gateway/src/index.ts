import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authApp from 'auth/dist/app.js';
import userApp from 'user/dist/app.js';
import jobApp from 'job/dist/app.js';
import aiApp from 'ai/dist/app.js';
import paymentApp from 'payment/dist/app.js';
import blogApp from 'blog/dist/app.js';
import chatApp from 'chat/dist/app.js';
import utilsApp from 'utils/dist/app.js';

// Import socket setup from chat service
import { setupSocket } from 'chat/dist/socket/handlers.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('API Gateway OK');
});

// Mount the services
app.use('/', authApp);
app.use('/', userApp);
app.use('/', jobApp);
app.use('/', aiApp);
app.use('/', paymentApp);
app.use('/', blogApp);
app.use('/', chatApp);
app.use('/', utilsApp);

const httpServer = createServer(app);

// Initialize Socket.IO with CORS config
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Setup socket event handlers from the chat service
setupSocket(io);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`🚀 API Gateway Monolith & WebSockets running on port ${PORT}`);
});
