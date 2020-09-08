import React, { useState, useEffect } from 'react';

import axios from 'axios';
import io from 'socket.io-client';

import copy from 'copy-to-clipboard';
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
import MultiGame from '../components/multiGame';

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
  const [socketId, setSocketId] = useState('');
  const [settings, setSettings] = useState({
    timer: 60,
    numRounds: 10,
    artists: [],
  });
  const [gameStart, setGameStart] = useState(false);

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
        setPlayers(serverPlayers);
      });

      socket.on('gameStart', () => {
        console.log('received game start msg');
        setGameStart(true);
      });
    }
  }, [socket, players]);

  const copyInviteLink = () => {
    copy(`http://localhost:3000/lobby?room=${room}`);
  };

  const updateSettings = (settings) => {
    setSettings(settings);
  };

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
      settings: settings,
    };
    console.log(info);
    if (isHost) {
      socket.emit('prepareGame', info);
      // TODO: add functionality to transfer to game page
    }
  };

  if (!gameStart) {
    return (
      <div>
        <div className='lobby-content'>
          <Container fluid style={{ padding: '0 2rem' }}>
            <Row>
              <Col>
                <h1 style={{ color: 'white', marginBottom: '2rem' }}>
                  Game Lobby
                </h1>
                <h5 style={{ color: 'white' }}>Room ID:</h5>
                <p style={{ color: 'white' }}>{room}</p>
                <h5 style={{ color: 'white' }}>
                  Invite Link:{' '}
                  <Button onClick={copyInviteLink} variant='info' size='sm'>
                    Copy Link
                  </Button>{' '}
                </h5>
                <p style={{ color: 'white' }}>
                  {`http://localhost:3000/lobby?room=${room}`}
                </p>

                <ListGroup style={{ padding: '1rem' }}>
                  <ListGroup.Item variant='dark'>
                    <i className='fa fa-users' aria-hidden='true'></i> Players
                    in Room:
                  </ListGroup.Item>
                  {players.map((player) => (
                    <ListGroup.Item variant='dark' key={player.socket_id}>
                      {player.name} {player.host && <b>[Host] </b>}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <div style={{ textAlign: 'center' }}>
                  {isHost && (
                    <Button
                      onClick={handleStartGame}
                      variant='info'
                      style={{ width: '30%' }}
                    >
                      <i className='fa fa-rocket' aria-hidden='true'></i> Start
                      Game
                    </Button>
                  )}
                </div>
              </Col>
              <Col lg='6'>
                <Settings isHost={isHost} updateSettings={updateSettings} />
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
  } else {
    return <MultiGame />;
  }
}
