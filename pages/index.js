import React, { useState } from 'react';

import styles from '../styles/Landing.module.css';

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
  process.env.NEXT_PUBLIC_BACK_END || 'http://localhost:5000';

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
      <div className={styles.landingBackground}>
        <Container className={styles.landingMain}>
          <Row>
            <Col lg={9}>
              <h1 className={styles.introText}>Can you SpotTheTrack?</h1>
            </Col>
            <Col lg={3} className={styles.landingButtonLayout}>
              <div>
                <Button
                  className={styles.landingButton}
                  size='lg'
                  variant='info'
                  type='submit'
                  onClick={handleHostSubmit}
                >
                  Host A Game
                </Button>
                <Button
                  className={styles.landingButton}
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
      <div className={styles.howToPlayLayout}>
        <Container className={styles.howToPlayContent} fluid>
          <h1>How to Play</h1>
          <Row style={{ marginTop: '2rem' }}>
            <Col className={styles.howToPlayCol} xl={3} lg={6} sm={6}>
              <img
                src='/images/how-to-play1.png'
                alt='how-to-play1'
                className={styles.howToPlayImg}
              ></img>
              <h5>Each Round ...</h5>
            </Col>
            <Col className={styles.howToPlayCol} xl={3} lg={6} sm={6}>
              <img
                src='/images/how-to-play2.png'
                alt='how-to-play2'
                className={styles.howToPlayImg}
              ></img>
              <h5>Try to guess the name of the song</h5>
            </Col>
            <Col className={styles.howToPlayCol} xl={3} lg={6} sm={6}>
              <img
                src='/images/how-to-play3.png'
                alt='how-to-play3'
                className={styles.howToPlayImg}
              ></img>
              <h5>Clues will be given out periodically</h5>
            </Col>
            <Col className={styles.howToPlayCol} xl={3} lg={6} sm={6}>
              <img
                src='/images/how-to-play4.png'
                alt='how-to-play4'
                className={styles.howToPlayImg}
              ></img>
              <h5>Winner goes to player with the most points</h5>
            </Col>
          </Row>
          <div style={{ marginTop: '4rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>
              Why you may not see some of your favorite songs
            </h2>
            <h6>
              For each song, our game attempts to retrieve a sample preview URL
              from Spotify.
            </h6>
            <h6>
              Unfortunately, some songs received from Spotify's API do not have
              a preview url.
            </h6>
          </div>
          <div style={{ marginTop: '3rem' }}>
            In Game icons made by{' '}
            <a
              href='https://www.flaticon.com/authors/pixel-perfect'
              title='Pixel perfect'
              className={styles.landingLink}
            >
              Pixel perfect
            </a>{' '}
            from{' '}
            <a
              href='https://www.flaticon.com/'
              title='Flaticon'
              className={styles.landingLink}
            >
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
            <Form.Group controlId='nameForRoom'>
              <Form.Control
                type='text'
                placeholder='Room ID'
                size='lg'
                onChange={handleRoomChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant='info' onClick={handleSubmitRoom}>
              Join Room
            </Button>
            <Button variant='secondary' onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </div>
  );
}
