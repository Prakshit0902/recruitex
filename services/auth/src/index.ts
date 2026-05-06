import app from "./app.js";
import dotenv from 'dotenv'
import {createClient} from 'redis'

dotenv.config()

export const redisClient = createClient({
    url : process.env.REDIS_URL
})

redisClient.connect()
.then(() => {
    console.log('Connected to Redis');
})
.catch((error) => {
    console.error('Error connecting to Redis:', error);
})


app.listen(process.env.PORT , () => {
    console.log('auth service running on ' , process.env.PORT);
    
})