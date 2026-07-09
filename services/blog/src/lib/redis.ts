import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = Redis.fromEnv();

console.log("✅ Connected to Upstash Redis");

export default redisClient;
