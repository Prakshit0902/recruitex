import express from "express";
import chatRoutes from "./routes/chat.js";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/chat", chatRoutes);

export default app;
