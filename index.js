const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const uuid = require('short-uuid');

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

const setIntervalX = (callback, delay, repetitions) => {
  let x = 0;
  let interval = setInterval( () => {
    callback();

    if (++x === repetitions) {
      clearInterval(interval);
    }
  }, delay);
};

io.on('connection', (socket) => {
  console.log('New websocket connection: ' + socket.id);

  socket.on('createRoom', () => {
    // Generates a new unique id for the room
    newRoom = uuid.generate();
    socket.join(newRoom);
    socket.emit('roomCode', newRoom);
  });

  socket.on('joinRoom', ({ name, room }) => {
    socket.join(room);
    socket.broadcast.to(room).emit('newUser', name);
  });

  setIntervalX( 
    () => emitRemainingTime(socket, Math.floor(new Date() / 1000)), 1000, 30);

  socket.on('chat', (data) => {
    socket.broadcast.emit('chat', data);
  });

  socket.on('disconnect', () => {
    console.log('Websocket ' + socket.id + ' has left.');
    io.emit('message', 'A User has left');
  });
});

const emitRemainingTime = (socket, time) => {
  const currentEpochTime = Math.floor(new Date() / 1000);
  const endEpochTime = time + 30;

  let response = {
    "current_time": currentEpochTime,
    "end_time": endEpochTime,
    "socket_id": socket.id,
  }
  socket.broadcast.emit('time', JSON.stringify(response));
};
