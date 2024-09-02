import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes.js"

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.send("API is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
