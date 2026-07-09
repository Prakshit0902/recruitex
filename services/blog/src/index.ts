import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import postRoutes from "./routes/post.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
app.use("/api/blog", postRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "Blog Service" });
});

app.listen(PORT, () => {
    console.log(`Blog service is running on http://localhost:${PORT}`);
});
