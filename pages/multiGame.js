import React, { useState, useEffect } from 'react';

// import GameChat from '../components/gameChat.js';
import ChatBubble from '../components/chatBubble.js';

import AudioPlayer from 'react-h5-audio-player';

import axios from 'axios';
import io from 'socket.io-client';

import { Container, Row, Col, Button, Form } from 'react-bootstrap';

import Link from 'next/link';

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

export default function MultiGame() {
  const socket = useSocket('http://localhost:5000');

  const Player = (url) => (
    <AudioPlayer
      autoplay
      src={url}
      onPlay={(e) => console.log('onPlay')}
      // other props here
    />
  );

  // fetched state to prevent over-fetching data
  const [fetched, setFetched] = React.useState(false);

  // store tracks from backend api
  const [tracks, setTracks] = React.useState(null);

  // state to update track
  const [currentTrack, setCurrentTrack] = React.useState(0);

  const [songName, setSongName] = React.useState(null);
  const [correctBanner, setCorrectBanner] = React.useState('');
  const [preview, setPreview] = React.useState(null);
  const [guess, setGuess] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [count, setCount] = useState([1]);

  useEffect(() => {
    if (!fetched) {
      fetchData();
    }

    // Don't change tracks upon initial render
    if (currentTrack > 0) {
      updateToNextTrack();
    }

    if (socket) {
      socket.on('chat', (data) => {
        setChatLog([...chatLog, data]);
      });
    }
  }, [socket, chatLog, currentTrack]);

  async function fetchData() {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/spotify/initializeGameState'
      );
      const data = JSON.parse(response.data);
      console.log(data);
      setTracks(data.tracks);
      setSongName(data.tracks[currentTrack].name);
      setPreview(data.tracks[currentTrack].preview);
      setFetched(true);
    } catch (err) {
      console.error(err);
    }
  }

  const updateToNextTrack = () => {
    setPreview(tracks[currentTrack].preview);
    setSongName(tracks[currentTrack].name);
  };

  const addToChatLog = (text) => {
    var guess = {
      name: 'Ivan',
      isMyself: true,
      time: '12:47',
      text: text,
    };
    setChatLog([...chatLog, guess]);
    setCount([...count, 1]);

    socket.emit('chat', {
      name: 'Broski',
      isMyself: false,
      time: '12:47',
      text: text,
    });
  };

  const handleGuessChange = (e) => {
    setGuess(e.target.value);
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    addToChatLog(guess);
    if (guess.trim().toLowerCase() === songName.toLowerCase()) {
      setCorrectBanner('Correct!');

      // TODO: add game finish page
      if (currentTrack < tracks.length - 1) {
        setCurrentTrack(currentTrack + 1);
      }
    } else {
      setCorrectBanner('False! Try Again!');
    }
    setGuess('');
  };

  return (
    <div>
      <div className='game-background'>
        <Container fluid style={{ padding: '0 2rem' }}>
          <Row>
            <Col lg='8'>
              <h1 style={{ color: 'white' }}>Guess The Song!</h1>
              <Row>
                <Col>
                  <img
                    src='/images/thinking.png'
                    alt='thinking'
                    style={{
                      width: '100%',
                      marginTop: '3rem',
                    }}
                  ></img>
                </Col>
                <Col>
                  <h1
                    style={{
                      textAlign: 'center',
                      color: 'white',
                    }}
                  >
                    {correctBanner}
                  </h1>
                  <img
                    src='/images/placeholder.png'
                    alt='rules1'
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      marginBottom: '1rem',
                    }}
                  ></img>
                  <Button color='primary' disabled>
                    {!tracks
                      ? 'Initializing Game State'
                      : `Round ${currentTrack + 1}`}
                  </Button>
                  <Player src={preview} />
                </Col>
              </Row>
            </Col>
            <Col lg='4'>
              <div className='msger'>
                <header className='msger-header'>
                  <div className='msger-header-title'>
                    <i className='fa fa-comment'></i> Game Chat
                  </div>
                  <div className='msger-header-options'>
                    <span>
                      <i className='fa fa-cog'></i>
                    </span>
                  </div>
                </header>
                <main className='msger-chat'>
                  {chatLog.map((guess) => (
                    <ChatBubble
                      key={Math.random()}
                      isMyself={guess.isMyself}
                      name={guess.name}
                      time={guess.time}
                      text={guess.text}
                    />
                  ))}
                </main>
                <form className='msger-inputarea' onSubmit={handleGuessSubmit}>
                  <input
                    type='text'
                    className='msger-input'
                    placeholder='Take a guess!'
                    onChange={handleGuessChange}
                    value={guess}
                  ></input>
                  <Button
                    variant='info'
                    type='submit'
                    className='msger-send-btn'
                  >
                    Send
                  </Button>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
