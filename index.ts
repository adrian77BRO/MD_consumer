import * as amqp from 'amqplib';
import axios from 'axios';

async function consumeMessages() {
    try {
        const connection = await amqp.connect('amqp://18.215.228.198');
        const channel = await connection.createChannel();

        const queue = 'datos';
        await channel.assertQueue(queue);

        console.log('Esperando mensajes...');

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const checkup = JSON.parse(msg.content.toString());
                console.log(checkup);
                console.log('Mensaje recibido:', checkup);
                const checkupData = {
                    heartRate: checkup.heartRate,
                    spo2: checkup.spo2,
                    temperature: checkup.temperature
                }
                sendData(checkupData);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function sendData(data: any) {
    try {
        await axios.post('http://18.205.225.198:3000/checkup', data);
        console.log('Datos enviados correctamente a la API');
    } catch (error) {
        console.error('Error al enviar datos a la API:', error);
    }
}

consumeMessages();