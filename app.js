const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
require('dotenv').config();
const server = http.createServer(app);
const io = socketio(server);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket) {
    console.log(`New connection: ${socket.id}`);
    socket.on("send-location", function(data) {
        console.log(`Location received from ${socket.id}:`, data);
        io.emit("receive-location", { id: socket.id, ...data });
    });
    socket.on("disconnect", function() {
        console.log(`User disconnected: ${socket.id}`);
        io.emit("user-disconnected", socket.id);
    });
});

app.get('/', function(req, res) {
    res.render('index');
});

const port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log(`Server is running on port ${port}`);
});
