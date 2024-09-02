import "dotenv/config";
import express from "express";

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("API is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
