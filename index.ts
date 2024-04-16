import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import * as amqp from 'amqplib';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

async function consumeMessages(socket: SocketIOServer) {
    try {
        const connection = await amqp.connect('amqp://18.215.228.198');
        const channel = await connection.createChannel();

        const queue = 'datos';
        await channel.assertQueue(queue);

        console.log('Esperando mensajes...');

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                console.log('Mensaje recibido:', msg.content.toString());
                const checkup = msg.content.toString();
                const checkupData = JSON.parse(checkup);
                console.log(checkupData)
                io.emit('sendData', checkupData);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

io.on('connection', (socket) => {
    console.log('Cliente conectado');
});

consumeMessages(io);

server.listen(8080, () => {
    console.log('Servidor Socket.IO escuchando en el puerto 4000');
});