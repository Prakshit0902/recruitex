import 'dotenv/config.js';
import { Kafka } from "kafkajs";
import nodemailer from 'nodemailer';

export const startSendMailConsumer = async () => {
    try {
        const kafka = new Kafka({
            clientId : 'mail-service',
            brokers : [process.env.KAFKA_BROKER || 'localhost:9092'],
            ssl: true,
            sasl: {
                mechanism: 'plain',
                username: process.env.KAFKA_USERNAME!,
                password: process.env.KAFKA_PASSWORD!,
            }
        })

        const consumer = kafka.consumer({groupId : 'mail-service-group'})
        await consumer.connect()
        const topicName = 'send-mail-topic'
        
        await consumer.subscribe({topic : topicName, fromBeginning : false})
        
        console.log('Mail service started listening for sending mail');

        await consumer.run({
            eachMessage : async ({topic, partition, message}) => {
                try {
                    const {to, subject, html} = JSON.parse(message.value?.toString() || '{}')
                    const transporter = nodemailer.createTransport({
                        host : 'smtp.gmail.com',
                        port : 465,
                        secure : true,

                        auth : {
                            user : process.env.EMAIL_USER,
                            pass : process.env.EMAIL_PASSWORD
                        }


                    })

                    await transporter.sendMail({
                        from : 'RecruitEx <no-reply>@',
                        to,
                        subject,
                        html
                    })

                    console.log(`Mail has been sent to ${to} with subject ${subject}`);
                    

                } catch (error) {
                    console.error('Error occurred while sending mail:', error);
                }
            }
        })
        
    

    } catch (error) {
        console.error('Error in mail consumer:', error);
    }


}
