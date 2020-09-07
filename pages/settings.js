import React, { useState } from 'react';

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  ListGroup,
  Modal,
} from 'react-bootstrap';

import axios from 'axios';

import RangeSlider from 'react-bootstrap-range-slider';

export default function Setting() {
  const [timer, setTimer] = useState(60);
  const [numRounds, setNumRounds] = useState(10);
  const [showToolTip, setShowToolTip] = useState('on');
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [artists, setArtists] = useState([]);
  const [artistKeyword, setArtistKeyword] = useState('');
  const [artistResults, setArtistResults] = useState([]);

  const handleChangeArtistKeyword = (e) => {
    setArtistKeyword(e.target.value);
  };

  const handleCloseArtistModal = (e) => {
    setShowArtistModal(false);
    setShowToolTip('off');
  };

  const handleSubmitArtistSearch = async (e) => {
    e.preventDefault();
    if (artistKeyword) {
      const response = await axios.get(
        'http://localhost:5000/api/spotify/searchArtist/' + artistKeyword
      );
      setArtistResults(response.data);
      setShowToolTip('off');
      setShowArtistModal(true);
    }
  };

  const handleSubmitArtistModal = (e) => {
    e.preventDefault();
    setArtistResults([]);
    setShowToolTip('off');
    setShowArtistModal(false);
  };

  return (
    <div>
      <div className='game-background'>
        <Container fluid style={{ padding: '0 2rem' }}>
          <Row>
            <Col>
              <h2 style={{ color: 'white' }}>Game Settings</h2>
              <div className='settings'>
                <Form style={{ color: 'white' }}>
                  <Form.Group as={Row} style={{ marginTop: '1rem' }}>
                    <Form.Label column lg={4}>
                      Time to Guess (seconds)
                    </Form.Label>
                    <Col lg={8}>
                      <RangeSlider
                        value={timer}
                        min={30}
                        max={120}
                        step={10}
                        size='lg'
                        tooltipPlacement='top'
                        tooltip={showToolTip}
                        variant='info'
                        onChange={(changeEvent) =>
                          setTimer(changeEvent.target.value)
                        }
                      />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} style={{ marginTop: '2rem' }}>
                    <Form.Label column lg={4}>
                      Number of Rounds
                    </Form.Label>
                    <Col lg={8}>
                      <RangeSlider
                        value={numRounds}
                        min={5}
                        max={20}
                        step={1}
                        size='lg'
                        tooltipPlacement='top'
                        tooltip={showToolTip}
                        variant='info'
                        onChange={(changeEvent) =>
                          setNumRounds(changeEvent.target.value)
                        }
                      />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column lg='4'>
                      Search For Artist
                    </Form.Label>
                    <Col lg='5'>
                      <Form.Control
                        type='text'
                        placeholder='Khalid, Post Malone ... '
                        value={artistKeyword}
                        onChange={handleChangeArtistKeyword}
                      />
                    </Col>
                    <Col lg='3'>
                      <Button
                        variant='info'
                        block
                        type='submit'
                        onClick={handleSubmitArtistSearch}
                      >
                        Search
                      </Button>
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column lg='4'>
                      Artists used for Next Game
                    </Form.Label>
                    <Col lg='8'>
                      <ListGroup>
                        {artists.length > 0 ? (
                          artists.map((artist) => (
                            <ListGroup.Item variant='light'>
                              {artist}
                            </ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item variant='light'>
                            No artists have been chosen yet.
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Col>
                  </Form.Group>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Form>
        <Modal show={showArtistModal} onHide={handleCloseArtistModal}>
          <Modal.Header>
            <Modal.Title>Which artist?</Modal.Title>
          </Modal.Header>
          <Form.Group controlId='ArtistSearchModal'>
            <ListGroup>
              {artistResults.map((artist) => (
                <ListGroup.Item variant='light'>{artist.name}</ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleSubmitArtistModal}>
              Select Artist
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </div>
  );
}
