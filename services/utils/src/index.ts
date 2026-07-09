import 'dotenv/config.js';
import express from 'express';
import routes from './routes.js';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import { startSendMailConsumer } from './consumer.js';

/*
 * Initializes and starts the Kafka consumer for sending emails.
 * Creates persistent connection to kafka broker and listens
 * for messages on the 'send-mail-topic'.
 * This is a long-running, non-blocking background process. Once invoked, 
 * KafkaJS maintains a persistent polling loop with the broker. It 'sleeps' 
 * while waiting for messages, and when a producer sends data to the topic, 
 * the event loop triggers the 'eachMessage' callback asynchronously without 
 * blocking the Express server's HTTP request handling.
 * 
 * the await keyword is used to ensure that the consumer is fully connected and
 *  subscribed before the server starts accepting requests.
 * However, once the consumer is running, it operates independently 
 * in the background, allowing the Express server to function normally without 
 * waiting for Kafka operations to complete.
 */

startSendMailConsumer()

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const app = express()

app.use(cors())
app.use(express.json({limit : '50mb'}))
app.use(express.urlencoded({limit : '50mb', extended : true}))

app.use('/api/utils',routes)    

app.listen(process.env.PORT, () => {
    console.log('Utils service running on port ', process.env.PORT);
    
})
