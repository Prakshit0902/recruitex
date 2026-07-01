import app from "./app.js";
import dotenv from 'dotenv'
import { Redis } from "@upstash/redis";

dotenv.config()

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})


app.listen(process.env.PORT , () => {
    console.log('auth service running on ' , process.env.PORT);
    
})