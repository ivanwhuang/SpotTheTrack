import React, { useState, useEffect } from 'react';

import axios from 'axios';
import io from 'socket.io-client';

import copy from 'copy-to-clipboard';
import HostSettings from '../components/hostSettings';
import Settings from '../components/Settings';

import ChatBubble from '../components/chatBubble.js';
import AudioPlayer from 'react-h5-audio-player';
import moment from 'moment';

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
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState('');
  const [players, setPlayers] = useState([]);
  const [socketId, setSocketId] = useState('');
  const [settings, setSettings] = useState({
    timer: 60,
    numRounds: 10,
    artists: [],
  });
  const [gameStart, setGameStart] = useState(false);

  // store tracks from backend api
  const [tracks, setTracks] = React.useState(null);

  // state to update track
  const [currentTrack, setCurrentTrack] = React.useState(0);
  const [songName, setSongName] = React.useState(null);
  const [correctBanner, setCorrectBanner] = React.useState('');
  const [preview, setPreview] = React.useState(null);
  const [guess, setGuess] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const Player = (url) => (
    <AudioPlayer
      autoPlay
      src={url}
      onPlay={(e) => console.log('onPlay')}
      // other props here
    />
  );

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
      socket.on('roomInfo', (serverPlayers) => {
        setPlayers(serverPlayers);
      });

      socket.on('updateSettings', (settings) => {
        setSettings(settings);
      });

      socket.on('gameStart', (data) => {
        setTracks(data.tracks);
        setSongName(data.tracks[currentTrack].name);
        setPreview(data.tracks[currentTrack].preview);
        setGameStart(true);
      });

      socket.on('chat', (newMsg) => {
        setChatLog([...chatLog, newMsg]);
      });
    }
    if (currentTrack > 0) {
      updateToNextTrack();
    }
  }, [socket, players, currentTrack, chatLog]);

  const copyInviteLink = () => {
    copy(`http://localhost:3000/lobby?room=${room}`);
  };

  const updateSettings = (settings) => {
    socket.emit('updateSettings', { settings, room });
  };

  const updateToNextTrack = () => {
    setPreview(tracks[currentTrack].preview);
    setSongName(tracks[currentTrack].name);
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
    let info = {
      room,
      settings: settings,
    };
    console.log(info);
    if (isHost) {
      socket.emit('prepareGame', info);
      // TODO: add functionality to transfer to game page
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

  if (!gameStart) {
    return (
      <div>
        <div className='lobby-content'>
          <Container fluid style={{ padding: '0 2rem' }}>
            <Row>
              <Col>
                <div
                  style={{
                    float: 'right',
                    marginTop: '0.5rem',
                    marginRight: '1rem',
                  }}
                >
                  {isHost && (
                    <Button onClick={handleStartGame} variant='info'>
                      <i className='fa fa-rocket' aria-hidden='true'></i> Start
                      Game
                    </Button>
                  )}
                </div>
                <h1 style={{ color: 'white', marginBottom: '2rem' }}>
                  Game Lobby
                </h1>
                <h5 style={{ color: 'white' }}>Room ID:</h5>
                <p style={{ color: 'lightGray' }}>{room}</p>
                <h5 style={{ color: 'white' }}>
                  Invite Link:{' '}
                  <Button onClick={copyInviteLink} variant='info' size='sm'>
                    Copy Link
                  </Button>{' '}
                </h5>
                <p style={{ color: 'lightGray' }}>
                  {`http://localhost:3000/lobby?room=${room}`}
                </p>
                <h5 style={{ color: 'white' }}>Players in Room:</h5>
                <ListGroup style={{ padding: '1rem' }}>
                  {players.map((player) => (
                    <ListGroup.Item
                      variant='dark'
                      key={player.socket_id}
                      style={{
                        border: '1px solid rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {player.name} {player.host && <b>[Host] </b>}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
              <Col lg='6'>
                {isHost ? (
                  <HostSettings updateSettings={updateSettings} />
                ) : (
                  <Settings settings={settings} />
                )}
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
  } else {
    return (
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
                  <AudioPlayer src={preview} />
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
    );
  }
}
