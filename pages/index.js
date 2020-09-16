import React, { useState } from 'react';

import Link from 'next/link';
import axios from 'axios';

import { useRouter } from 'next/router';

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Alert,
} from 'react-bootstrap';

const backendBaseURL =
  process.env.PRODUCTION_BACK_END || 'http://localhost:5000';

export default function Home() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [room, setRoom] = useState('');

  const handleHostSubmit = (e) => {
    e.preventDefault();
    router.push('/lobby');
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleRoomChange = (e) => {
    setRoom(e.target.value);
  };

  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    if (room) {
      const response = await axios.get(
        `${backendBaseURL}/api/lobby/isValidRoom/` + room
      );
      const isValidRoom = response.data;
      if (isValidRoom) {
        router.push('/lobby?room=' + room);
      } else {
        setShowAlert(true);
      }
    }
  };

  return (
    <div>
      <div className='landing-background'>
        <Container className='landing-main'>
          <Row>
            <Col lg={9}>
              <h1 className='intro-text'>Can you SpotTheTrack?</h1>
            </Col>
            <Col
              lg={3}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <Button
                  className='landing-button'
                  size='lg'
                  variant='info'
                  type='submit'
                  onClick={handleHostSubmit}
                >
                  Host A Game
                </Button>
                <Button
                  className='landing-button'
                  size='lg'
                  variant='secondary'
                  type='submit'
                  onClick={handleJoinSubmit}
                >
                  Find A Game
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className='landing-rules-wrapper'>
        <Container className='landing-rules'>
          <h1>How to Play</h1>
          <Row>
            <Col className='rule-col'>
              <img
                src='/images/placeholder.png'
                alt='rules1'
                style={{ width: '90%' }}
              ></img>
              <div style={{ marginTop: '1rem' }}>Each Round ....</div>
            </Col>
            <Col className='rule-col'>
              <img
                src='/images/placeholder.png'
                alt='rules1'
                style={{ width: '90%' }}
              ></img>
              <div style={{ marginTop: '1rem' }}>
                Try to guess the name of the song
              </div>
            </Col>
          </Row>
          <Row>
            <Col className='rule-col'>
              <img
                src='/images/placeholder.png'
                alt='rules1'
                style={{ width: '90%' }}
              ></img>
              <div style={{ marginTop: '1rem' }}>
                Clues will be given out periodically.
              </div>
            </Col>
            <Col className='rule-col'>
              <img
                src='/images/placeholder.png'
                alt='rules1'
                style={{ width: '90%' }}
              ></img>
              <div style={{ marginTop: '1rem' }}>
                Winner goes to player with the most points
              </div>
            </Col>
          </Row>
          <div>
            In Game icons made by{' '}
            <a
              href='https://www.flaticon.com/authors/pixel-perfect'
              title='Pixel perfect'
            >
              Pixel perfect
            </a>{' '}
            from{' '}
            <a href='https://www.flaticon.com/' title='Flaticon'>
              {' '}
              www.flaticon.com
            </a>
          </div>
        </Container>
      </div>
      <Form>
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Join By Room ID</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {showAlert && (
              <Alert
                variant='danger'
                onClose={() => setShowAlert(false)}
                dismissible
              >
                <Alert.Heading>Woops..</Alert.Heading>
                <p>That room does not exist</p>
              </Alert>
            )}
            <Form.Group controlId='nameForRoom' className='landing-button'>
              <Form.Control
                type='text'
                placeholder='Room ID'
                size='lg'
                onChange={handleRoomChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant='secondary' onClick={handleSubmitRoom}>
              Enter Game Lobby
            </Button>
            <Button variant='primary' onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </div>
  );
}
