const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const uuid = require('short-uuid');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/spotify', require('./api/spotify'));
app.use('/api/lobby', require('./api/lobby'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

// global variable storing the rooms
var rooms = {};

// global variable keeping track of the room for each socket
var roomOfSocket = {};

const io = socketio(server);

io.on('connection', (socket) => {
  console.log('New websocket connection: ' + socket.id);

  socket.on('createRoom', (name) => {
    // Generates a new unique id for the room
    newRoom = uuid.generate();

    // construct host object
    let host = {
      socket_id: socket.id,
      host: true,
      name,
      score: 0,
      answered: false,
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
    socket.emit('roomInfo', rooms[newRoom]);
  });

  socket.on('joinRoom', ({ name, room }) => {
    socket.join(room);

    // construct player object
    let player = {
      socket_id: socket.id,
      host: false,
      name,
      score: 0,
      answered: false,
    };

    // set nickname for socket
    socket.nickname = name;

    // map socket_id to room
    roomOfSocket[socket.id] = room;

    // append player to room
    rooms[room].push(player);

    // send frontend update room information
    io.in(room).emit('roomInfo', rooms[room]);
  });

  socket.on('updateSettings', ({ room, settings }) => {
    io.in(room).emit('updateSettings', settings);
  });

  socket.on('prepareGame', async ({room, settings}) => {
    console.log(settings);
    console.log(rooms[room]);
    // rooms[settings.room] = settings;

    // .... Do some prep work
    try {
      const response = await axios.get(
        'http://localhost:5000/api/spotify/initializeGameState'
      );
      const data = JSON.parse(response.data);

      // send countdown to clients in room
      io.in(room).emit('countdown', {"serverTime": Date.now() + 5000});

      // wait 5 seconds before actually starting the game
      setTimeout(() => {
        let x = 0;
        io.in(room).emit('gameStart', { "track": data.tracks[x++] });
        console.log((parseInt(settings.timer) + 5) * 1000);

        let interval = setInterval(() => {
          io.in(room).emit('newRound', data.tracks[x++]);
          // console.log(`emitted new round using ${data.tracks[x]}`);
          if (x >= parseInt(settings.numRounds)) {
            clearInterval(interval);
            console.log('game has finished');
          }
        }, (parseInt(settings.timer) + 5) * 1000);
      }, 5000);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('chat', ({ room, name, isMyself, time, text }) => {
    var newMsg = { name, isMyself, time, text };
    socket.to(room).emit('chat', newMsg);
  });

  socket.on('disconnect', () => {
    console.log('Websocket ' + socket.id + ' has left.');
    io.of('/')
      .in(roomOfSocket[socket.id])
      .clients((err, clients) => {
        if (err) {
          console.error(err);
        } else {
          let tmpRoomPlayers;
          // delete room if all clients have disconnected from room
          if (clients.length <= 0) {
            tmpRoomPlayers = rooms[roomOfSocket[socket.id]];
            console.log(`room to delete: ${roomOfSocket[socket.id]}`);
            delete rooms[roomOfSocket[socket.id]];
            console.log(`deleted room: ${rooms[roomOfSocket[socket.id]]}`); // should be undefined
          }

          try {
            // delete the disconnected socket from memory
            if (socket.id in roomOfSocket) {
              // find and delete player associated to socket in rooms
              let players;
              if (roomOfSocket[socket.id] in rooms) {
                players = rooms[roomOfSocket[socket.id]];
              } else {
                players = tmpRoomPlayers;
              }

              if (
                players.find((player) => player.socket_id === socket.id).host &&
                clients.length > 0
              ) {
                players = players.filter(
                  (player) => player.socket_id !== socket.id
                );

                // change host and tell client
                players[0].host = true;
                io.to(players[0].socket_id).emit('changeHost');
              } else {
                players = players.filter(
                  (player) => player.socket_id !== socket.id
                );
              }

              // Update room information in server
              rooms[roomOfSocket[socket.id]] = players;

              // Update room information in client
              socket.to(roomOfSocket[socket.id]).emit('roomInfo', players);

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
