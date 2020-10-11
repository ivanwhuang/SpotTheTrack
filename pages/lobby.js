import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import styles from '../styles/Lobby.module.css';

import axios from 'axios';
import io from 'socket.io-client';
import ReactGA from 'react-ga';

import HostSettings from '../components/hostSettings';
import Settings from '../components/settings';
// import ChatBubble from '../components/chatBubble.js';
import GameChat from '../components/gameChat.js';

import copy from 'copy-to-clipboard';
import AudioPlayer from 'react-h5-audio-player';
import moment from 'moment';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import Blur from 'react-blur-image';
import HashLoader from 'react-spinners/HashLoader';

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

const frontEndBaseURL =
  process.env.NEXT_PUBLIC_FRONT_END || 'http://localhost:3000';

const backendBaseURL =
  process.env.NEXT_PUBLIC_BACK_END || 'http://localhost:5000';

const analytics_id = process.env.NEXT_PUBLIC_GA_ID || '';

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

  const socket = useSocket(backendBaseURL);

  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ header: '', text: '' });
  const [name, setName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [falseRoom, setFalseRoom] = useState(false);
  const [room, setRoom] = useState('');
  const [players, setPlayers] = useState([]);
  const [settings, setSettings] = useState({
    timer: 30,
    numRounds: 5,
    artists: [],
  });

  const [roomState, setRoomState] = useState('lobby');

  // state to update track
  const [currentGameState, setCurrentGameState] = useState({
    round: -1,
    track: '',
  });

  const [roundEnd, setRoundEnd] = useState(false);

  const [trackList, setTrackList] = useState([]);
  const [hint, setHint] = useState([]);

  const [AttemptResponse, setAttemptResponse] = useState('Take a guess!');
  const [guess, setGuess] = useState('');
  const [answered, setAnswered] = useState(false);
  const [chatLog, setChatLog] = useState([]);

  const [countDown, setCountDown] = useState(null);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    if (socket && !socketConnected) {
      if (analytics_id !== '') {
        ReactGA.initialize(analytics_id);
        ReactGA.pageview('/lobby');
      }

      socket.on('connect', () => {
        setSocketConnected(true);
      });

      socket.on('newRoom', (newRoom) => {
        setRoom(newRoom);
        setLoading(false);
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
          setAttemptResponse('Take a guess!');
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
        setHint(track.hints['noHintStr']);
        setChatLog(roundChat);
        setGuess('');

        let newGameState = {
          round: round,
          track: track,
        };

        setCurrentGameState(newGameState);
        setAttemptResponse('Take a guess!');
        setRoundEnd(false);
        setAnswered(false);
        setCountDown(Math.floor(serverTime / 1000 - Date.now() / 1000));
        setTimerKey(round);
      });

      socket.on('chat', (roundChat) => {
        setChatLog(roundChat);
      });

      socket.on('endOfGame', () => {
        setCurrentGameState({
          round: -1,
          track: '',
        });
        setRoomState('endOfGame');
      });

      socket.on('disconnect', () => {
        router.push('/');
        console.log('you have been disconncted');
      });
    }
  }, [socket]);

  const renderTime = ({ remainingTime }) => {
    if (currentGameState.round <= 0) {
      return (
        <div className={styles.timerText}>
          <div>Starting In</div>
          <div>{remainingTime}</div>
          <div>seconds</div>
        </div>
      );
    } else {
      if (remainingTime <= 0) {
        return <div className={styles.timerText}>Time's up!</div>;
      } else {
        if (
          remainingTime ==
            Math.floor(
              settings.timer / (currentGameState.track.numHints + 1)
            ) &&
          currentGameState.track.numHints >= 1
        ) {
          setHint(
            currentGameState.track.hints[
              'hintStr' + currentGameState.track.numHints
            ]
          );
        } else if (
          remainingTime ==
            Math.floor(settings.timer / (currentGameState.track.numHints + 1)) *
              2 &&
          currentGameState.track.numHints >= 2
        ) {
          setHint(
            currentGameState.track.hints[
              'hintStr' + (currentGameState.track.numHints - 1)
            ]
          );
        } else if (
          remainingTime ==
            Math.floor(settings.timer / (currentGameState.track.numHints + 1)) *
              3 &&
          currentGameState.track.numHints >= 3
        ) {
          setHint(
            currentGameState.track.hints[
              'hintStr' + (currentGameState.track.numHints - 2)
            ]
          );
        } else if (
          remainingTime ==
            Math.floor(settings.timer / (currentGameState.track.numHints + 1)) *
              4 &&
          currentGameState.track.numHints >= 4
        ) {
          setHint(
            currentGameState.track.hints[
              'hintStr' + (currentGameState.track.numHints - 3)
            ]
          );
        } else if (
          remainingTime ==
            Math.floor(settings.timer / (currentGameState.track.numHints + 1)) *
              5 &&
          currentGameState.track.numHints == 5
        ) {
          setHint(
            currentGameState.track.hints[
              'hintStr' + (currentGameState.track.numHints - 4)
            ]
          );
        }

        return (
          <div className={styles.timerText}>
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
        highScore = player.score;
      }
    });
    players.forEach((player) => {
      if (player.score == highScore) {
        winners.push(player.name);
      }
    });
    return <h1 style={{ color: 'White' }}>Winner(s): {winners.join(', ')}</h1>;
  };

  const copyInviteLink = () => {
    copy(`${frontEndBaseURL}/lobby?room=${room}`);
    setToastInfo({
      header: 'Copied!',
      text: 'Invitation link copied to clipboard.',
    });
    setShowToast(true);
  };

  // used in HostSettings component
  const updateSettings = (settings) => {
    socket.emit('updateSettings', { room, settings });
  };

  const handleBackToHome = () => {
    router.push('/');
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
          `${backendBaseURL}/api/lobby/isValidRoom/` + room
        );

        const isValidRoom = response.data;

        if (isValidRoom) {
          socket.emit('joinRoom', { name, room });
          setRoom(room);
          setLoading(false);
        } else {
          setFalseRoom(true);
        }
      } else {
        // Host of room
        socket.emit('createRoom', name);
        setIsHost(true);
        if (analytics_id !== '') {
          ReactGA.event({
            category: 'Create Room',
            action: 'A new room has been created',
          });
        }
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
      if (analytics_id !== '') {
        ReactGA.event({
          category: 'Start Game',
          action: 'Host has started a new game',
        });
      }
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
      if (!answered && !roundEnd && currentGameState.round > 0) {
        if (
          guess.trim().toLowerCase() ===
          currentGameState.track.name.toLowerCase()
        ) {
          setAttemptResponse('Correct!');
          socket.emit('correctGuess', room);
          setAnswered(true);
        } else {
          setAttemptResponse('Try Again!');
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
        <Container fluid className={styles.lobbyContainer}>
          {loading ? (
            <div className={styles.loadingLayout}>
              <div>
                {falseRoom && <h1>Invalid Room</h1>}
                <HashLoader
                  size={180}
                  loading={loading}
                  color='#17a2b8'
                  css='margin: 2rem 0rem 2rem 1.5rem;'
                />
                {falseRoom && (
                  <Button
                    onClick={handleBackToHome}
                    className={styles.backToHomeBtn}
                    variant='info'
                  >
                    Back to Home
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Row>
              <Col style={{ minHeight: '80vh' }}>
                <Button
                  onClick={handleBackToHome}
                  className={styles.backToHomeBtn}
                  variant='info'
                >
                  <i className='fa fa-arrow-left' aria-hidden='true'></i> Back
                  to Home
                </Button>
                <h5 style={{ color: 'white' }}>Room ID:</h5>
                <p style={{ color: 'lightGray' }}>{room}</p>
                <h5 style={{ color: 'white' }}>
                  Invite Your Friends!{' '}
                  <Button onClick={copyInviteLink} variant='info' size='sm'>
                    Copy Link
                  </Button>{' '}
                </h5>
                <p style={{ color: 'lightGray' }}>
                  {`${frontEndBaseURL}/lobby?room=${room}`}
                </p>
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ color: 'white' }}>Players</h1>
                </div>
                <div className={styles.playersLayout}>
                  {players.map((player) => (
                    <Card key={player.socket_id} className={styles.playerCard}>
                      <Card.Body className={styles.playerCardBody}>
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
                  className={styles.toastLayout}
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
                      className={styles.startGameBtn}
                    >
                      <i className='fa fa-rocket' aria-hidden='true'></i> Start
                      Game
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          )}
        </Container>
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
            <Modal.Body>
              <Form.Group controlId='nameForRoom'>
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
            </Modal.Body>
          </Modal>
        </Form>
      </div>
    );
  } else if (roomState === 'game') {
    return (
      <Container fluid className={styles.gameContainer}>
        <Row>
          <Col md={6} lg={4} style={{ textAlign: 'center', minHeight: '80vh' }}>
            <div className={styles.timerLayout}>
              <CountdownCircleTimer
                key={timerKey}
                isPlaying
                onComplete={() => {
                  setHint(currentGameState.track.name);
                  setRoundEnd(true);
                }}
                duration={countDown}
                colors={
                  currentGameState.round > 0
                    ? [['#17a2b8'], ['#17b8a6']]
                    : [['#EF798A'], ['#F4A7B2']]
                }
              >
                {renderTime}
              </CountdownCircleTimer>
            </div>
            <h1 style={{ color: 'white' }}>Players</h1>
            <div className={styles.playersLayout}>
              {players.map((player) => (
                <Card
                  key={player.socket_id}
                  className={
                    player.answered
                      ? styles.playerCardAnswered
                      : styles.playerCard
                  }
                >
                  <Card.Body className={styles.playerCardBody}>
                    <div>
                      <i
                        class='fa fa-user fa-2x'
                        aria-hidden='true'
                        style={{ color: '#505050' }}
                      ></i>
                    </div>
                    <div>
                      {player.name} {player.host && <b>[Host] </b>}
                    </div>
                  </Card.Body>
                  <Card.Footer className={styles.playerCardFooter}>
                    {player.score}
                  </Card.Footer>
                </Card>
              ))}
            </div>
          </Col>
          <Col className={styles.roundInfoLayout} md={6} lg={4}>
            <div className={styles.roundInfo}>
              <h1>
                {currentGameState.round == settings.numRounds
                  ? 'Last Round'
                  : currentGameState.round > 0
                  ? `Round ${currentGameState.round}`
                  : 'Game Will Begin Shortly'}
              </h1>
              <h4>
                {AttemptResponse} &nbsp;
                {AttemptResponse === 'Correct!' ? (
                  <img
                    className={styles.attemptResponse}
                    src='/images/check.png'
                    alt='correct'
                  />
                ) : AttemptResponse === 'Try Again!' ? (
                  <img
                    className={styles.attemptResponse}
                    src='/images/remove.png'
                    alt='wrong'
                  />
                ) : null}
              </h4>
              <div>
                <Blur
                  img={
                    currentGameState.round > 0
                      ? currentGameState.track.artwork
                      : ''
                  }
                  blurRadius={8}
                  className={styles.blurTrackArtwork}
                >
                  {}
                </Blur>
                <div className={styles.hintLabel}>
                  <h3>
                    {currentGameState.round > 0 &&
                      [...hint].map((c) =>
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
                  className={styles.audioPlayer}
                />
              </div>
            </div>
          </Col>
          <Col md={12} lg={4} className={styles.chatLayout}>
            <GameChat
              chatLog={chatLog}
              socket_id={socket.id}
              guess={guess}
              handleGuessChange={handleGuessChange}
              handleGuessSubmit={handleGuessSubmit}
            />
          </Col>
        </Row>
      </Container>
    );
  } else {
    return (
      <Container fluid className={styles.endGameContainer}>
        <Row>
          <Col style={{ minHeight: '80vh', textAlign: 'center' }}>
            <h1 style={{ color: 'white', marginBottom: '2rem' }}>
              Final Scores
            </h1>
            <div className={styles.playersLayout}>
              {players.map((player) => (
                <Card key={player.socket_id} className={styles.playerCard}>
                  <Card.Body className={styles.playerCardBody}>
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
                  <Card.Footer className={styles.playerCardFooter}>
                    {player.score}
                  </Card.Footer>
                </Card>
              ))}
            </div>
            <Button
              variant='info'
              className={styles.backToLobbyBtn}
              onClick={() => setRoomState('lobby')}
            >
              Return to Lobby
            </Button>
          </Col>
          <Col lg='7' style={{ textAlign: 'center' }}>
            <Winners />
            <div
              style={{
                margin: '2rem 0',
              }}
            >
              <h4 style={{ color: 'White' }}>Songs used this Game</h4>
              <div className={styles.songCardsLayout}>
                {trackList.map((track) => (
                  <Card key={track.name} className={styles.songCard}>
                    <a href={track.url} target='_blank'>
                      <img
                        className='card-img-top'
                        src={track.artwork}
                        alt='song-img'
                      />
                      <Card.Body className={styles.songCardBody}>
                        <h6 className='card-title'>{track.name}</h6>
                        <p>
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
    );
  }
}
