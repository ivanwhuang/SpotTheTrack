import React, { useState } from 'react';

import Link from 'next/link';

import { useRouter } from 'next/router';

import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';

export default function Home() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
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

  const handleSubmitRoom = (e) => {
    e.preventDefault();
    if (room) {
      router.push('/lobby?room=' + room);
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
            <Col lg={3} style={{}}>
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
              <Link href='/soloGame'>
                <Button className='landing-button' size='lg' variant='success'>
                  Play By Myself
                </Button>
              </Link>
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
        </Container>
      </div>
      <Form>
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Join By Room ID</Modal.Title>
          </Modal.Header>
          <Form.Group controlId='nameForRoom' className='landing-button'>
            <Form.Control
              type='text'
              placeholder='Room ID'
              size='lg'
              onChange={handleRoomChange}
            />
          </Form.Group>
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
