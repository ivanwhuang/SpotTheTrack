import React, { useState, useEffect } from 'react';

import axios from 'axios';
import io from 'socket.io-client';

import copy from 'copy-to-clipboard';
import HostSettings from '../components/hostSettings';
import Settings from '../components/settings';

import ChatBubble from '../components/chatBubble.js';
import AudioPlayer from 'react-h5-audio-player';
import moment from 'moment';

import { useRouter } from 'next/router';

import { CountdownCircleTimer } from 'react-countdown-circle-timer';

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Card,
  Toast,
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
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ header: '', text: '' });
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

  const [roomState, setRoomState] = useState('lobby');

  // state to update track
  const [currentGameState, setCurrentGameState] = useState({
    round: 0,
    songName: '',
    preview: null,
  });
  const [correctBanner, setCorrectBanner] = useState('');
  const [guess, setGuess] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const [countDown, setCountDown] = useState(null);
  // const [serverTime, setServerTime] = useState(null);
  const [timerKey, setTimerKey] = useState(0);

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
      socket.on('roomInfo', (roomInfo) => {
        setPlayers(roomInfo.players);
        setSettings(roomInfo.settings);
      });

      socket.on('newUser', (name) => {
        setToastInfo({ header: 'Welcome!', text: `${name} has joined` });
        setShowToast(true);
      });

      socket.on('userDisconnected', (name) => {
        setToastInfo({ header: 'Bye!', text: `${name} has left` });
        setShowToast(true);
      });

      socket.on('initialCountdown', ({ serverTime }) => {
        setRoomState('game');
        setCountDown(Math.floor(serverTime / 1000 - Date.now() / 1000));
        setTimerKey(timerKey + 1);
        console.log(countDown);
      });

      // Prob no longer need this event since it's similar to the newRound event.
      socket.on('gameStart', ({ track, serverTime }) => {
        if (track != null) {
          let newGameState = {
            round: 1,
            songName: track.name,
            preview: track.preview,
          };
          setCurrentGameState(newGameState);
          setCountDown(Math.floor(serverTime / 1000 - Date.now() / 1000));
          setTimerKey(timerKey + 1);
        }
      });

      socket.on('newRound', ({ track, serverTime }) => {
        let newGameState = {
          round: currentGameState.round + 1,
          songName: track.name,
          preview: track.preview,
        };
        setCurrentGameState(newGameState);
        setCountDown(Math.floor(serverTime / 1000 - Date.now() / 1000));

        setTimerKey(timerKey + 1);
      });

      socket.on('chat', (newMsg) => {
        setChatLog([...chatLog, newMsg]);
      });

      socket.on('endOfGame', () => {
        setCurrentGameState({
          round: 0,
          songName: '',
          preview: null,
        });
        setRoomState('endOfGame');
      });

      socket.on('disconnect', () => {
        alert('You have been disconnected');
        router.push('/');
      });
    }
  }, [socket, players, currentGameState, chatLog, timerKey]);

  const renderTime = ({ remainingTime }) => {
    if (currentGameState.round <= 0) {
      return (
        <div style={{ fontSize: '24px', textAlign: 'center', color: 'white' }}>
          <div>Starting In</div>
          <div>{remainingTime}</div>
          <div>seconds</div>
        </div>
      );
    } else {
      if (remainingTime <= 0) {
        return (
          <div style={{ fontSize: '24px', color: 'white' }}>Time's up!</div>
        );
      }
      if (remainingTime <= 10) {
        return (
          <div>
            <div
              style={{ fontSize: '20px', textAlign: 'center', color: 'white' }}
            >
              You got this!
            </div>
            <div
              style={{ fontSize: '24px', textAlign: 'center', color: 'white' }}
            >
              {remainingTime}
            </div>
            <div
              style={{ fontSize: '24px', textAlign: 'center', color: 'white' }}
            >
              seconds
            </div>
          </div>
        );
      }
      return (
        <div style={{ fontSize: '24px', textAlign: 'center', color: 'white' }}>
          <div>Remaining</div>
          <div>{remainingTime}</div>
          <div>seconds</div>
        </div>
      );
    }
  };

  const copyInviteLink = () => {
    copy(`http://localhost:3000/lobby?room=${room}`);
  };

  // used in HostSettings component
  const updateSettings = (settings) => {
    socket.emit('updateSettings', { room, settings });
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmitName = async (e) => {
    e.preventDefault();
    if (name) {
      setShowModal(false);
      const { room } = router.query;
      if (room) {
        // Not host
        const response = await axios.get(
          'http://localhost:5000/api/lobby/isValidRoom/' + room
        );
        const isValidRoom = response.data;
        if (isValidRoom) {
          socket.emit('joinRoom', { name, room });
          setRoom(room);
        } else {
          alert('This room does not exist');
          router.push('/');
        }
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
    if (settings.artists.length > 0) {
      let info = {
        room,
        settings: settings,
      };
      socket.emit('prepareGame', info);
    } else {
      setToastInfo({
        header: 'Woops!',
        text: 'Not enough artists to start game',
      });
      setShowToast(true);
    }
  };

  const addToChatLog = (text) => {
    var guess = {
      name: name,
      isMyself: true,
      time: moment().format('LT'),
      text: text,
    };
    setChatLog([...chatLog, guess]);

    socket.emit('chat', {
      room: room,
      name: name,
      isMyself: false,
      time: moment().format('LT'),
      text: text,
    });
  };

  const handleGuessChange = (e) => {
    setGuess(e.target.value);
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (
      guess.trim().toLowerCase() === currentGameState.songName.toLowerCase()
    ) {
      setCorrectBanner('Correct!');
      let correctMsg = {
        name: 'SpotTheTrack',
        isMyself: false,
        time: moment().format('LT'),
        text: 'Good Job! You guessed the right song!',
      };
      socket.emit('correctGuess', room);
      setChatLog([...chatLog, correctMsg]);
    } else {
      setCorrectBanner('False! Try Again!');
      addToChatLog(guess);
    }
    setGuess('');
  };

  if (roomState === 'lobby') {
    return (
      <div>
        <div className='lobby-content'>
          <Container fluid style={{ padding: '0 2rem' }}>
            <Row>
              <Col style={{ minHeight: '80vh' }}>
                <h1 style={{ color: 'white', marginBottom: '2rem' }}>
                  Game Lobby
                </h1>
                <h5 style={{ color: 'white' }}>Room ID:</h5>
                <p style={{ color: 'lightGray' }}>{room}</p>
                <h5 style={{ color: 'white' }}>
                  Invite Your Fiends!{' '}
                  <Button onClick={copyInviteLink} variant='info' size='sm'>
                    Copy Link
                  </Button>{' '}
                </h5>
                <p style={{ color: 'lightGray' }}>
                  {`http://localhost:3000/lobby?room=${room}`}
                </p>
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ color: 'white' }}>Players</h1>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  {players.map((player) => (
                    <Card
                      variant='dark'
                      key={player.socket_id}
                      style={{
                        width: '8rem',
                        margin: '1rem',
                        textAlign: 'center',
                        background: 'lightgray',
                      }}
                    >
                      <Card.Body>
                        <div>
                          <i
                            class='fa fa-user fa-3x'
                            aria-hidden='true'
                            style={{ color: '#505050' }}
                          ></i>
                        </div>
                        <div>
                          {player.name} {player.host && <b>[Host] </b>}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Col>
              <Col lg='6'>
                <Toast
                  onClose={() => setShowToast(false)}
                  show={showToast}
                  delay={4000}
                  autohide
                  style={{
                    position: 'absolute',
                    top: '0',
                    right: '20px',
                    width: '15rem',
                  }}
                >
                  <Toast.Header>
                    <strong className='mr-auto'>{toastInfo.header}</strong>
                    <small>{moment().format('LT')}</small>
                  </Toast.Header>
                  <Toast.Body>{toastInfo.text}</Toast.Body>
                </Toast>
                {isHost ? (
                  <HostSettings
                    updateSettings={updateSettings}
                    settings={settings}
                  />
                ) : (
                  <Settings settings={settings} />
                )}
                <div style={{ textAlign: 'center' }}>
                  {isHost && (
                    <Button
                      onClick={handleStartGame}
                      variant='info'
                      style={{ marginTop: '1rem', width: '50%' }}
                    >
                      <i className='fa fa-rocket' aria-hidden='true'></i> Start
                      Game
                    </Button>
                  )}
                </div>
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
  } else if (roomState === 'game') {
    return (
      <div className='game-background'>
        <Container fluid style={{ padding: '0 2rem' }}>
          <Row>
            <Col lg='4' style={{ textAlign: 'center' }}>
              <div style={{ margin: '1rem 0' }}>
                {countDown == null ? (
                  'Game has not started..'
                ) : (
                  <div className='timer-wrapper'>
                    <CountdownCircleTimer
                      key={timerKey}
                      isPlaying
                      duration={countDown}
                      colors={
                        currentGameState.round > 0
                          ? [['#17a2b8'], ['#17b8a6']]
                          : [['#EF798A'], ['#F4A7B2']]
                      }
                      style={{ width: '0' }}
                    >
                      {renderTime}
                    </CountdownCircleTimer>
                  </div>
                )}
              </div>
              <h1 style={{ color: 'white' }}>Players</h1>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {players.map((player) => (
                  <Card
                    variant='dark'
                    key={player.socket_id}
                    style={{
                      width: '8rem',
                      margin: '0.5rem',
                      textAlign: 'center',
                      background: 'lightgray',
                    }}
                  >
                    <Card.Body>
                      <div>
                        <i
                          class='fa fa-user fa-2x'
                          aria-hidden='true'
                          style={{ color: '#505050' }}
                        ></i>
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        {player.name} {player.host && <b>[Host] </b>}
                      </div>
                    </Card.Body>
                    <Card.Footer style={{ padding: '.1rem 1.25rem' }}>
                      {player.score}
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            </Col>
            <Col style={{ textAlign: 'center' }}>
              <h1 style={{ color: 'white' }}>
                {currentGameState.round > 0
                  ? `Round ${currentGameState.round}`
                  : 'Game Will Begin Shortly'}
              </h1>
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
              <AudioPlayer
                src={currentGameState.preview}
                autoPlayAfterSrcChange
                volume={0.2}
              />
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
    );
  } else {
    return (
      <div className='endOfGame-content'>
        <Container fluid style={{ padding: '0 2rem' }}>
          <Row>
            <Col style={{ minHeight: '80vh' }}>
              <h1 style={{ color: 'white', marginBottom: '2rem' }}>
                Final Scores
              </h1>
              {players.map((player) => (
                <Card
                  variant='dark'
                  key={player.socket_id}
                  style={{
                    width: '9rem',
                    margin: '1rem',
                    textAlign: 'center',
                    background: 'lightgray',
                  }}
                >
                  <Card.Body>
                    <div>
                      <i
                        class='fa fa-user fa-3x'
                        aria-hidden='true'
                        style={{ color: '#505050' }}
                      ></i>
                    </div>
                    <div>
                      {player.name} {player.host && <b>[Host] </b>}
                    </div>
                  </Card.Body>
                  <Card.Footer style={{ padding: '.1rem 1.25rem' }}>
                    {player.score}
                  </Card.Footer>
                </Card>
              ))}
            </Col>
            <Col lg='6' style={{ color: 'White' }}>
              <h1>Winner: JeLeeButler</h1>
              <h2>
                Songs used this Game: (song name, artist, url to Spotify page)
              </h2>
              {/*<Button
                variant='info'
                onClick={() => {
                  setRoomState('lobby');
                }}
              >
                Return to Lobby
              </Button>*/}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
