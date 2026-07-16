import app from "./app.js";
import dotenv from 'dotenv'
import { connectKafka } from "./producer.js";
import { Redis } from "@upstash/redis";

dotenv.config()

app.listen(process.env.PORT , () => {
    console.log('auth service running on ' , process.env.PORT);
    connectKafka();
})
