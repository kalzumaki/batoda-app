const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('message', (data) => {
    console.log('Received message:', data);
    io.emit('message', data); // Broadcast message to all connected clients
  });
});

const PORT = 3001; // Replace with your preferred port
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
