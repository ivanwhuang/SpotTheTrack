import React, { useState } from 'react';

import Header from '../components/header.js';
import Footer from '../components/footer.js';
// import GameChat from '../components/gameChat.js';
import ChatBubble from '../components/chatBubble.js';

import AudioPlayer from 'react-h5-audio-player';

import axios from 'axios';

import { Container, Row, Col, Button, Form } from 'react-bootstrap';

import Link from 'next/link';

export default function SoloGame() {
    const Player = (url) => (
        <AudioPlayer
            autoPlay
            src={url}
            onPlay={(e) => console.log('onPlay')}
            // other props here
        />
    );

    const [songName, setSongName] = React.useState(null);
    const [correctBanner, setCorrectBanner] = React.useState('');
    const [preview, setPreview] = React.useState(null);
    const [guess, setGuess] = useState('');
    const [chatLog, setChatLog] = useState([]);

    const handleGuessChange = (e) => {
        setGuess(e.target.value);
    };

    const handleGuessSubmit = (e) => {
        e.preventDefault();
        addToChatLog(guess);
        if (guess.trim().toLowerCase() === songName.toLowerCase()) {
            // alert('Correct!');
            setCorrectBanner('Correct!');
        } else {
            // alert('Wrong!');
            setCorrectBanner('False! Try Again!');
        }
        setGuess('');
    };

    const addToChatLog = (text) => {
        var guess = {
            name: 'Ivan',
            isMyself: true,
            time: '12:47',
            text: text,
        };
        setChatLog([...chatLog, guess]);
    };

    React.useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(
                    'http://localhost:5000/api/spotify/gettrack'
                );
                const data = JSON.parse(response.data);
                console.log(data);
                setSongName(data.name);
                setPreview(data.preview);
                console.log(preview);
            } catch (err) {
                console.error(err);
            }
        }
        fetchData();
    }, []);

    return (
        <div>
            <Header />
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
                                    <AudioPlayer src={preview} />
                                </Col>
                            </Row>
                        </Col>
                        <Col lg='4'>
                            <div className='msger'>
                                <header className='msger-header'>
                                    <div className='msger-header-title'>
                                        <i className='fa fa-comment'></i> Game
                                        Chat
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

                                <form
                                    className='msger-inputarea'
                                    onSubmit={handleGuessSubmit}
                                >
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

            <Footer />
        </div>
    );
}
