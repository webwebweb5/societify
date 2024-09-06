import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./db/connectDB.js";
import mongoose from "mongoose";

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.send("API is running...");
});

app.get("/health", async (_req, res) => {
  const dbState =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

  // Respond with health check information
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbState,
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
