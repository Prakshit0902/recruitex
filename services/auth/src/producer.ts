import { Kafka, Producer, Admin } from "kafkajs";

let producer : Producer
let admin : Admin

export const connectKafka = async () => {
    try {
        const kafka = new Kafka({
            clientId: 'auth-service',
            brokers: [process.env.KAFKA_BROKER_URL!],
            ssl: true,
            sasl: {
                mechanism: 'plain',
                username: process.env.KAFKA_USERNAME!,
                password: process.env.KAFKA_PASSWORD!,
            },
            retry: {
                initialRetryTime: 300,
                retries: 2
            }
        })

        admin = kafka.admin()
        await admin.connect()

        const topics = await admin.listTopics()

        if (!topics.includes('send-mail-topic')) {
            await admin.createTopics({
                topics : [
                    {
                        topic : 'send-mail-topic',
                        numPartitions : 1,
                        replicationFactor : 1
                    }
                ]
            })

            console.log('Topic created with name send-mail-topic');
            
        }

        await admin.disconnect()

        producer = kafka.producer()
        await producer.connect()

        console.log('Connected to Kafka producer');


        

    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }

}

export const publishToTopic = async (topic : string, message : any) => {
    if (!producer) {
        console.error('Producer is not connected');
        return
    }


    try {
        producer.send({
            topic,
            messages : [
                {
                    value : JSON.stringify(message)
                }
            ]
        })

    } catch (error) {
        console.error('Error publishing to topic:', error);
    }
}


export const disconnectKafka = async () => {
    try {
        if (producer) {
            await producer.disconnect()
            console.log('Kafka producer disconnected');
        }
    } catch (error) {
        console.error('Error disconnecting Kafka producer:', error);
    }
}
 
