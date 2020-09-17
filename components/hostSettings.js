import React, { useState, useEffect } from 'react';

import {
  Row,
  Col,
  Button,
  Form,
  ListGroup,
  Modal,
  Card,
} from 'react-bootstrap';

import axios from 'axios';

import RangeSlider from 'react-bootstrap-range-slider';

const backendBaseURL =
  process.env.NEXT_PUBLIC_BACK_END || 'http://localhost:5000';

export default function HostSetting({ updateSettings, settings }) {
  const [timer, setTimer] = useState(settings.timer);
  const [numRounds, setNumRounds] = useState(settings.numRounds);
  const [artists, setArtists] = useState(settings.artists);
  const [showToolTip, setShowToolTip] = useState('on');
  const [artistKeyword, setArtistKeyword] = useState('');
  const [artistResults, setArtistResults] = useState([]);
  const [showArtistModal, setShowArtistModal] = useState(false);

  const [isMoving, setIsMoving] = useState(false);

  const [newSettings, setNewSettings] = useState(false);

  // update the settings state in lobby upon any change to any of the settings
  useEffect(() => {
    if (newSettings) {
      var settings = { timer: timer, numRounds: numRounds, artists: artists };
      updateSettings(settings);
    }
  }, [timer, numRounds, artists]);

  const handleChangeTimer = (e) => {
    setTimer(e.target.value);
    setNewSettings(true);
  };

  const handleChangeRounds = (e) => {
    setNumRounds(e.target.value);
    setNewSettings(true);
  };

  const handleChangeArtistKeyword = (e) => {
    setArtistKeyword(e.target.value);
  };

  const handleCloseArtistModal = (e) => {
    setShowArtistModal(false);
    setShowToolTip('on');
  };

  const handleSubmitSearchArtist = async (e) => {
    e.preventDefault();
    if (artistKeyword) {
      const response = await axios.get(
        `${backendBaseURL}/api/spotify/searchArtist/` + artistKeyword
      );
      setArtistResults(response.data);
      setShowToolTip('off');
      setShowArtistModal(true);
    }
  };

  const handleSubmitSelectArtist = (newArtist) => {
    return (event) => {
      event.preventDefault();
      if (!artists.includes(newArtist)) {
        setArtists([...artists, newArtist]);
      }

      setShowToolTip('on');
      setShowArtistModal(false);
      setNewSettings(true);
    };
  };

  const handleRemoveArtist = (artistToRemove) => {
    return (event) => {
      event.preventDefault();
      setArtists(artists.filter((artist) => artist !== artistToRemove));
      setNewSettings(true);
    };
  };

  return (
    <div>
      <h1 style={{ color: 'white' }}>Game Settings</h1>
      <h6 style={{ color: 'white' }}>
        Only the host of the room can change settings
      </h6>
      <div className='settings'>
        <Form style={{ color: 'white' }}>
          <fieldset>
            <Form.Group as={Row} style={{ marginTop: '2rem' }}>
              <Form.Label column lg={4}>
                Time to Guess (seconds)
              </Form.Label>
              <Col lg={8}>
                <RangeSlider
                  value={timer}
                  min={20}
                  max={60}
                  step={10}
                  size='lg'
                  tooltipPlacement='top'
                  tooltip={showToolTip}
                  variant='info'
                  onChange={handleChangeTimer}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} style={{ marginTop: '1rem' }}>
              <Form.Label column lg={4}>
                Number of Rounds
              </Form.Label>
              <Col lg={8}>
                <RangeSlider
                  value={numRounds}
                  min={5}
                  max={10}
                  step={1}
                  size='lg'
                  tooltipPlacement='top'
                  tooltip={showToolTip}
                  variant='info'
                  onChange={handleChangeRounds}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column lg='4'>
                Search For Artist
              </Form.Label>
              <Col sm='9' lg='5'>
                <Form.Control
                  type='text'
                  placeholder='Khalid, Lauv ... '
                  value={artistKeyword}
                  onChange={handleChangeArtistKeyword}
                />
              </Col>
              <Col sm='3'>
                <Button
                  variant='info'
                  block
                  type='submit'
                  onClick={handleSubmitSearchArtist}
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
                      <ListGroup.Item
                        variant='light'
                        key={artist}
                        style={{
                          border: '1px solid rgba(0, 0, 0, 0.3)',
                          color: '#212529',
                        }}
                      >
                        {artist}
                        <Button
                          variant='secondary'
                          size='sm'
                          style={{ float: 'right', fontSize: '0.650rem' }}
                          onClick={handleRemoveArtist(artist)}
                        >
                          <i class='fa fa-times fa-xs' aria-hidden='true'></i>
                        </Button>
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
          </fieldset>
        </Form>
      </div>
      <Form>
        <Modal show={showArtistModal} onHide={handleCloseArtistModal} size='xl'>
          <Modal.Header closeButton>
            <Modal.Title>Which Artist?</Modal.Title>
          </Modal.Header>
          <Modal.Body className='artist-modal-background'>
            <Form.Group controlId='ArtistSearchModal'>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {artistResults.map((artist) => (
                  <Card
                    border='dark'
                    key={artist['name']}
                    style={{ width: '15rem', margin: '1rem' }}
                    className='artist-card'
                  >
                    <Card.Img
                      src={
                        artist['images'].length > 0
                          ? artist['images'][0]['url']
                          : '/images/placeholder.png'
                      }
                      style={{ height: '15rem' }}
                    />

                    <Card.Body>
                      <Card.Title>
                        <a></a>
                        {artist['name']}
                      </Card.Title>
                      <Card.Text style={{ marginBottom: '0' }}>
                        <b>Genres: </b>

                        {artist['genres'].length > 0
                          ? artist['genres'].join(', ')
                          : 'Unknown'}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <Button
                        variant='info'
                        block
                        onClick={handleSubmitSelectArtist(artist['name'])}
                      >
                        Add to List
                      </Button>
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseArtistModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </div>
  );
}
