import React, { useState, useEffect, useRef } from 'react';

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
import Blur from 'react-blur-image';

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Card,
  Toast,
  ListGroup,
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

  const messagesEndRef = useRef(null);

  const scrollToBottomOfChat = () => {
    messagesEndRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  };

  const [socketConnected, setSocketConnected] = useState(false);

  const [showModal, setShowModal] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ header: '', text: '' });
  const [name, setName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState('');
  const [players, setPlayers] = useState([]);
  const [settings, setSettings] = useState({
    timer: 60,
    numRounds: 5,
    artists: [],
  });

  const [roomState, setRoomState] = useState('lobby');

  // state to update track
  const [currentGameState, setCurrentGameState] = useState({
    round: -1,
    track: '',
  });
  const [trackList, setTrackList] = useState([]);
  const [hint, setHint] = useState([]);

  const [correctBanner, setCorrectBanner] = useState('Take a guess!');
  const [guess, setGuess] = useState('');
  const [answered, setAnswered] = useState(false);
  const [chatLog, setChatLog] = useState([]);

  const [countDown, setCountDown] = useState(null);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    if (socket && !socketConnected) {
      socket.on('connect', () => {
        setSocketConnected(true);
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

      socket.on('playerInfo', (players) => {
        setPlayers(players);
      });

      socket.on('updateSettings', (settings) => {
        setSettings(settings);
      });

      socket.on('newUser', (name) => {
        setToastInfo({ header: 'Welcome!', text: `${name} has joined` });
        setShowToast(true);
      });

      socket.on('userDisconnected', (name) => {
        setToastInfo({ header: 'Bye!', text: `${name} has left` });
        setShowToast(true);
      });

      socket.on(
        'initialCountdown',
        ({ initialTimerKey, serverTime, trackList, playerInfo, roundChat }) => {
          setTrackList(trackList);
          setRoomState('game');
          setCountDown(Math.floor(serverTime / 1000 - Date.now() / 1000));
          setTimerKey(initialTimerKey);
          setCorrectBanner('Take a guess!');
          setPlayers(playerInfo);
          setChatLog(roundChat);
        }
      );

      socket.on('numTracksError', (artists) => {
        setToastInfo({
          header: 'Whoops!',
          text: `We could not find enough tracks for ${artists}`,
        });
        setShowToast(true);
      });

      socket.on('newRound', ({ round, track, serverTime, roundChat }) => {
        setHint(track.noHintStr);
        setChatLog(roundChat);
        let newGameState = {
          round: round,
          track: track,
        };

        setCurrentGameState(newGameState);
        setCorrectBanner('Take a guess!');
        setAnswered(false);
        setCountDown(Math.floor(serverTime / 1000 - Date.now() / 1000));
        setTimerKey(round);
      });

      socket.on('chat', (roundChat) => {
        setChatLog(roundChat);
        scrollToBottomOfChat();
      });

      socket.on('endOfGame', () => {
        setCurrentGameState({
          round: -1,
          track: '',
        });
        setRoomState('endOfGame');
      });

      socket.on('disconnect', () => {
        alert('You have been disconnected');
        router.push('/');
        console.log('you have been disconncted');
      });
    }
  }, [socket]);

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
      } else {
        if (remainingTime == Math.floor(settings.timer / 3)) {
          setHint(currentGameState.track.hintStr2);
        }
        if (remainingTime == Math.floor(settings.timer / 3) * 2) {
          setHint(currentGameState.track.hintStr1);
        }
        return (
          <div
            style={{ fontSize: '24px', textAlign: 'center', color: 'white' }}
          >
            <div>Remaining</div>
            <div>{remainingTime}</div>
            <div>seconds</div>
          </div>
        );
      }
    }
  };

  const Winners = () => {
    let highScore = 0;
    let winners = [];
    players.forEach((player) => {
      if (player.score >= highScore) {
        winners.push(player.name);
        highScore = player.score;
      }
    });
    return <h1 style={{ color: 'White' }}>Winner(s): {winners.join(', ')}</h1>;
  };

  const addNewMsgToChat = (msg) => {
    setChatLog(...chatLog, msg);
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
    socket.emit('chat', {
      room: room,
      name: name,
      socketid: socket.id,
      time: moment().format('LT'),
      text: text,
    });
  };

  const handleGuessChange = (e) => {
    setGuess(e.target.value);
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (guess.length > 0) {
      if (!answered && currentGameState.round > 0) {
        if (
          guess.trim().toLowerCase() ===
          currentGameState.track.name.toLowerCase()
        ) {
          setCorrectBanner('Correct!');
          socket.emit('correctGuess', room);
          setAnswered(true);
        } else {
          setCorrectBanner('Try Again!');
          addToChatLog(guess);
        }
      } else {
        addToChatLog(guess);
      }
      setGuess('');
    }
  };

  if (roomState === 'lobby') {
    return (
      <div>
        <div className='lobby-content'>
          <Container fluid style={{ padding: '0 2rem' }}>
            <Row>
              <Col style={{ minHeight: '80vh' }}>
                <h1 style={{ color: 'white', marginBottom: '2rem' }}></h1>
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
                        width: '9rem',
                        margin: '1rem',
                        textAlign: 'center',
                        background: 'lightgray',
                        border: 'thick solid gray',
                      }}
                    >
                      <Card.Body style={{ padding: '1rem 0.75rem' }}>
                        <div>
                          <i
                            className='fa fa-user fa-3x'
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
            <Col
              md={6}
              lg={4}
              style={{ textAlign: 'center', minHeight: '80vh' }}
            >
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
                      width: '9rem',
                      margin: '0.5rem',
                      textAlign: 'center',
                      background: 'lightgray',
                      border: player.answered
                        ? 'thick solid #28B463'
                        : 'thick solid gray',
                    }}
                  >
                    <Card.Body style={{ padding: '1rem 0.75rem' }}>
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
            <Col
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
              md={6}
              lg={4}
            >
              <div
                style={{
                  padding: '2rem 1rem',
                  background: '#6c757d',
                  borderRadius: '20px',
                  width: '100%',
                }}
              >
                <h1 style={{ color: 'white' }}>
                  {currentGameState.round > 0
                    ? `Round ${currentGameState.round}`
                    : 'Game Will Begin Shortly'}
                </h1>
                <h4
                  style={{
                    textAlign: 'center',
                    color: 'white',
                  }}
                >
                  {correctBanner} &nbsp;
                  {correctBanner === 'Correct!' ? (
                    <img
                      style={{
                        height: '1.5rem',
                        marginTop: '0',
                        marginBottom: '0.3rem',
                      }}
                      src='/images/check.png'
                      alt='correct'
                    />
                  ) : correctBanner === 'Try Again!' ? (
                    <img
                      style={{
                        height: '1.5rem',
                        marginTop: '0',
                        marginBottom: '0.3rem',
                        opacity: '0.8',
                      }}
                      src='/images/remove.png'
                      alt='wrong'
                    />
                  ) : null}
                </h4>
                <div>
                  <Blur
                    className='test-image'
                    img={
                      currentGameState.round > 0
                        ? currentGameState.track.artwork
                        : ''
                    }
                    blurRadius={8}
                    style={{
                      width: 200,
                      height: 200,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      borderRadius: '20px',
                    }}
                  >
                    {}
                  </Blur>
                  <div style={{ color: 'white', margin: '1.5rem 0' }}>
                    <h3>
                      {currentGameState.round > 0 &&
                        hint.map((c) =>
                          c != ' ' ? <span> {c} </span> : <span> &nbsp; </span>
                        )}
                    </h3>
                  </div>
                  <AudioPlayer
                    src={
                      currentGameState.round > 0
                        ? currentGameState.track.preview
                        : null
                    }
                    autoPlayAfterSrcChange
                    volume={0.2}
                    style={{
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      width: '80%',
                      borderRadius: '20px',
                    }}
                  />
                </div>
              </div>
            </Col>
            <Col
              md={12}
              lg={4}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div className='msger'>
                <header className='msger-header'>
                  <div className='msger-header-title'>Game Chat</div>
                </header>
                <main className='msger-chat'>
                  {chatLog.map((guess) => (
                    <ChatBubble
                      key={Math.random()}
                      isMyself={guess.socketid == socket.id}
                      name={guess.name}
                      time={guess.time}
                      text={guess.text}
                    />
                  ))}
                  <div ref={messagesEndRef}></div>
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
            <Col style={{ minHeight: '80vh', textAlign: 'center' }}>
              <h1 style={{ color: 'white', marginBottom: '2rem' }}>
                Final Scores
              </h1>
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
                      width: '9rem',
                      margin: '0.5rem',
                      textAlign: 'center',
                      background: 'lightgray',
                      border: 'thick solid gray',
                    }}
                  >
                    <Card.Body style={{ padding: '1rem 0.75rem' }}>
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
              </div>
              <Button
                variant='info'
                style={{ marginTop: '1rem', width: '50%' }}
                onClick={() => setRoomState('lobby')}
              >
                Return to Lobby
              </Button>
            </Col>
            <Col lg='7' style={{ textAlign: 'center' }}>
              {/* <h1>Winner(s): {getWinners.join(', ')}</h1> */}
              <Winners />
              <div
                style={{
                  margin: '2rem 0',
                }}
              >
                <h4 style={{ color: 'White' }}>Songs used this Game</h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  {trackList.map((track) => (
                    <Card
                      key={track.name}
                      style={{
                        width: '10rem',
                        margin: '0.5rem',
                        textAlign: 'center',
                        background: '#fdfdfe',
                      }}
                      className='song-card'
                    >
                      <a
                        style={{
                          color: '#212529',
                          textDecoration: 'none',
                          padding: '0',
                        }}
                        href={track.url}
                        target='_blank'
                      >
                        <img
                          class='card-img-top'
                          src={track.artwork}
                          alt='song-img'
                        />
                        <Card.Body style={{ padding: '1rem 1rem 0rem 1rem' }}>
                          <h6 class='card-title'>{track.name}</h6>
                          <p style={{ fontSize: '12px' }}>
                            {track.artists
                              .map((artist) => artist.name)
                              .join(', ')}
                          </p>
                        </Card.Body>
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
