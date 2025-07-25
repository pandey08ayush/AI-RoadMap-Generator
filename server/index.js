import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
import roadmaps from "./routes/roadmap.js";

dotenv.config(); // ✅ Load environment variables early
const app = express();

// ✅ Middlewares
app.use(cors({
    origin: "http://localhost:5173", // frontend URL
  }));
app.use(express.json()); // ✅ To parse incoming JSON payloads



// ✅ Basic Route
app.get("/", (req, res) => {
  res.send("✅ RoadMap backend is running.");
});

// ✅ Routes
app.use("/api", roadmaps);


// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB(); // connect to MongoDB first
  console.log(`🚀 Server is running on port ${PORT}`);
});
