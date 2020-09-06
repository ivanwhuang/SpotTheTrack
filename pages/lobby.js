import React, { useState, useEffect } from 'react';

import axios from 'axios';
import io from 'socket.io-client';

import { useRouter } from 'next/router';

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  ListGroup,
  Modal,
} from 'react-bootstrap';

function useSocket(url) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io(url);

    setSocket(socketIo);

    function cleanup() {
      socketIo.disconnect();
    }
    return cleanup;

    // should only run once and not on every re-render,
    // so pass an empty array
  }, []);

  return socket;
}

export default function Lobby() {
  const router = useRouter();

  const socket = useSocket('http://localhost:5000');

  const [showModal, setShowModal] = useState(true);
  const [name, setName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState('');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('roomCode', (newRoom) => {
        setRoom(newRoom);
      });

      socket.on('newUser', (player) => {
        setPlayers([...players, player.name]);
      });

      // update client info of players with server knowledge
      socket.on('roomInfo', (serverPlayers) => {
        console.log(name, serverPlayers);
        let playersToAppend = serverPlayers.filter(serverPlayer => serverPlayer.name !== name);
        setPlayers([...players, ...(playersToAppend.map((aPlayer) => aPlayer.name))]);
      });

      // remove disconnected player from client info
      socket.on('userDisconnected', (playerName) => {
        let filteredPlayers = players.filter(player => player !== playerName);
        setPlayers(filteredPlayers);
      });
    }
  }, [socket, players]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmitName = (e) => {
    e.preventDefault();
    if (name) {
      setShowModal(false);
      const { room } = router.query;
      if (room) {
        // Not host
        socket.emit('joinRoom', { name, room });
        setRoom(room);
      } else {
        // Host of room
        socket.emit('createRoom', name);
        setIsHost(true);
      }
      setPlayers([...players, name]);
    }
  };

  // on button click start game
  // need to send the following to server:
  // - players
  // - game settings
  const handleStartGame = (e) => {
    e.preventDefault();
    let info = {
      room,
      settings: null,
    };
    if (isHost) {
      socket.emit('gameStart', info);
      // TODO: add functionality to transfer to game page
    }
  }

  return (
    <div>
      <div className='game-background'>
        <Container fluid style={{ padding: '0 2rem' }}>
          <Row>
            <Col>
              <h2 style={{ color: 'white' }}>Room ID: {room}</h2>
            </Col>

            <Col>
              <ListGroup>
                <ListGroup.Item variant='dark'>Players in Room:</ListGroup.Item>
                {players.map((name) => (
                  <ListGroup.Item variant='dark'>{name}</ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          </Row>
        </Container>
      </div>
      <Form>
        <Modal
          show={showModal}
          onHide={handleSubmitName}
          backdrop='static'
          keyboard={false}
        >
          <Modal.Header>
            <Modal.Title>What is your name?</Modal.Title>
          </Modal.Header>
          <Form.Group controlId='nameForRoom' className='landing-button'>
            <Form.Control
              type='text'
              placeholder='Name'
              size='lg'
              onChange={handleNameChange}
            />
          </Form.Group>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleSubmitName}>
              Enter Game Lobby
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
      <Button onClick={handleStartGame}>
        Start Game
      </Button>
    </div>
  );
}
