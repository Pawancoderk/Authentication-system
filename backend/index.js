import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
dotenv.config();

await connectDb();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.log("Missing redisUrl");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch(console.error);

const app = express();

// middleware
app.use(express.json());

// importing routes

import userRoutes from "./routes/user.js";

// using routes
app.use("/api/v1", userRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App is running on PORT: ${port}`);
});
