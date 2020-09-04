const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/spotify', require('./api/spotify'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);
const io = socketio(server);

io.on('connection', (socket) => {
  console.log('New websocket connection: ' + socket.id);

  socket.on('chat', (data) => {
    socket.broadcast.emit('chat', data);
  });

  socket.on('disconnect', () => {
    console.log('Websocket ' + socket.id + ' has left.');
    io.emit('message', 'A User has left');
  });
});
