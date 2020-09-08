import React, { useState, useEffect } from 'react';

import axios from 'axios';
import io from 'socket.io-client';

import Settings from '../components/settings';

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

function HostButton({ host, cb }) {
  if (host) {
    return (
      <Button onClick={cb} variant='info'>
        <i className='fa fa-rocket' aria-hidden='true'></i> Start Game
      </Button>
    );
  }
  return null;
}

export default function Lobby() {
  const router = useRouter();

  const socket = useSocket('http://localhost:5000');

  const [showModal, setShowModal] = useState(true);
  const [name, setName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState('');
  const [players, setPlayers] = useState([]);
  const [socketId, setSocketId] = useState('');
  const [settings, setSettings] = useState({
    timer: 60,
    numRounds: 10,
    artists: [],
  });

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log(socket.id);
        setSocketId(socket.id);
      });

      socket.on('roomCode', (newRoom) => {
        setRoom(newRoom);
      });

      socket.on('changeHost', () => {
        setIsHost(true);
      });

      // update client info of players with server knowledge
      socket.on('roomInfo', (serverPlayers) => {
        console.log(serverPlayers);
        setPlayers(serverPlayers);
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
  };

  const getSettings = (settings) => {
    setSettings(settings);
    console.log(settings);
  };

  return (
    <div>
      <div className='game-background'>
        <Container fluid style={{ padding: '0 2rem' }}>
          <Row>
            <Col>
              <h2 style={{ color: 'white' }}>Room ID: {room}</h2>
              <ListGroup>
                <ListGroup.Item variant='dark'>
                  <i className='fa fa-users' aria-hidden='true'></i> Players in
                  Room:
                </ListGroup.Item>
                {players.map((player) => (
                  <ListGroup.Item variant='dark'>
                    {player.name}{' '}
                    {isHost && player.socket_id === socketId && <b>[Host] </b>}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <HostButton host={isHost} cb={handleStartGame} />
            </Col>
            <Col lg='6'>
              <Settings isHost={isHost} storeSettings={getSettings} />
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
    </div>
  );
}
