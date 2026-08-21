import { Kafka, Producer, Admin } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

let producer: Producer;
let admin: Admin;

export const connectKafka = async () => {
    try {
        const kafka = new Kafka({
            clientId: "chat-service",
            brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
            ssl: true,
            sasl: {
                mechanism: "plain",
                username: process.env.KAFKA_USERNAME!,
                password: process.env.KAFKA_PASSWORD!,
            },
            retry: {
                initialRetryTime: 300,
                retries: 2
            }
        });

        admin = kafka.admin();
        await admin.connect();

        const topics = await admin.listTopics();

        if (!topics.includes("send-mail-topic")) {
            await admin.createTopics({
                topics: [
                    {
                        topic: "send-mail-topic",
                        numPartitions: 1,
                        replicationFactor: 1,
                    },
                ],
            });
            console.log("✅ Topic 'send-mail-topic' created");
        }

        await admin.disconnect();

        producer = kafka.producer();

        await producer.connect();

        console.log("✅ Connected to Kafka producer");
    } catch (error) {
        console.log("Failed to connect to Kafka", error);
    }
};

export const publishToTopic = async (topic: string, message: any) => {
    if (!producer) {
        console.log("Kafka producer is not initialized");
        return;
    }

    try {
        await producer.send({
            topic: topic,
            messages: [
                {
                    value: JSON.stringify(message),
                },
            ],
        });
    } catch (error) {
        console.log("Failed to publish message to Kafka", error);
    }
};

export const disconnectKafka = async () => {
    if (producer) {
        producer.disconnect();
    }
};
