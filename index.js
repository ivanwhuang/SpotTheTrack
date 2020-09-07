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

// global variable storing the rooms
let rooms = {};

// global variable keeping track of the room for each socket
let roomOfSocket = {};

const io = socketio(server);

io.on('connection', (socket) => {
  console.log('New websocket connection: ' + socket.id);

  socket.on('createRoom', (name) => {
    // Generates a new unique id for the room
    newRoom = uuid.generate();

    // construct host object
    let host = {
      "socket_id": socket.id,
      "host": true,
      name,
      "score": 0,
    };

    // set nickname for socket
    socket.nickname = name;

    // map socket_id to room
    roomOfSocket[socket.id] = newRoom;

    // append player to room
    rooms[newRoom] = [host];

    // socket functionality to join room and tell frontend
    socket.join(newRoom);
    socket.emit('roomCode', newRoom);
  });

  socket.on('joinRoom', ({ name, room }) => {
    socket.join(room);

    // construct player object
    let player = {
      "socket_id": socket.id,
      "host": false,
      name,
      "score": 0,
    };

    // set nickname for socket
    socket.nickname = name;

    // map socket_id to room
    roomOfSocket[socket.id] = room;

    // append player to room
    rooms[room].push(player);

    // notify frontend of new player joining room
    socket.broadcast.to(room).emit('newUser', player);

    // send frontend update room information
    socket.emit('roomInfo', rooms[room]);
  });

  socket.on('getRoomInformation', (room) => {
    let players = rooms[room];
    socket.emit('roomInfo', players);
  });

  socket.on('gameStart', (settings) => {
    console.log(settings);
    console.log(rooms[settings.room]);
  });

  setIntervalX( 
    () => emitRemainingTime(socket, Math.floor(new Date() / 1000)), 1000, 30);

  socket.on('chat', (data) => {
    socket.broadcast.emit('chat', data);
  });

  // socket.on('willDisconnect', (clientSocket) => {
  //   setTimeout(() => {
  //     let room = Object.keys(clientSocket.rooms);
  //     console.log(room);
  //     io.of('/').in(room[1]).clients( (err, clients) => {
  //       if (clients.length <= 0) {
  //         delete rooms[room[1]];
  //         console.log(`deleted room ${room[1]}`);
  //       }
  //     });
  //   }, 1000);
  // });

  socket.on('disconnect', () => {
    console.log('Websocket ' + socket.id + ' has left.');
    // io.emit('message', 'A User has left');
    io.of('/').in(roomOfSocket[socket.id]).clients( (err, clients) => {
      if (err) {
        console.error(err);
      } else {
        let tmpRoomPlayers;
        // delete room if all clients have disconnected from room
        if (clients.length <= 0) {
          tmpRoomPlayers = rooms[roomOfSocket[socket.id]];
          delete rooms[roomOfSocket[socket.id]];
          console.log(`deleted room ${roomOfSocket[socket.id]}`);
          console.log(rooms[roomOfSocket[socket.id]]);  // should be undefined
        }

        try {
          // delete the disconnected socket from memory
          if (socket.id in roomOfSocket) {
            socket
              .to(roomOfSocket[socket.id])
              .emit('userDisconnected', socket.nickname);

            // find and delete player associated to socket in rooms
            let players;
            if (roomOfSocket[socket.id] in rooms) {
              players = rooms[roomOfSocket[socket.id]];
            } else {
              players = tmpRoomPlayers;
            }
            console.log(players.find(player => player.socket_id === socket.id));
            players = players.filter(player => player.socket_id !== socket.id);
            rooms[roomOfSocket[socket.id]] = players;

            delete roomOfSocket[socket.id];
            console.log(`deleted ${socket.id} from memory`);
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  });
});

/*
  Function: emitRemainingTime
  Desc:     Helper function to tell clients the server time
*/
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

/*
  Function: setIntervalX
  Desc:     Invokes callback x times for delay long
*/
const setIntervalX = (callback, delay, repetitions) => {
  let x = 0;
  let interval = setInterval( () => {
    callback();

    if (++x === repetitions) {
      clearInterval(interval);
    }
  }, delay);
};
