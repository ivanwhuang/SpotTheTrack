import React, { useState, useEffect } from 'react';

import Header from '../components/header.js';
import Footer from '../components/footer.js';

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
  // const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState('');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('roomCode', (newRoom) => {
        setRoom(newRoom);
      });
      socket.on('newUser', (name) => {
        setPlayers([...players, name]);
        console.log(name);
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
        setPlayers([...players, name]);
      } else {
        // Host of room
        socket.emit('createRoom');
        setPlayers([...players, name]);
      }
    }
  };

  return (
    <div>
      <Header />
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
      <Footer />
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
