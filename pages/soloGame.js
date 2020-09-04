import Header from '../components/header.js';
import Footer from '../components/footer.js';
import GameChat from '../components/gameChat.js';

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
    const [preview, setPreview] = React.useState(null);

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
                                    <img
                                        src='/images/placeholder.png'
                                        alt='rules1'
                                        style={{
                                            width: '100%',
                                            marginTop: '4rem',
                                            marginBottom: '1rem',
                                        }}
                                    ></img>
                                    <AudioPlayer src={preview} />
                                </Col>
                            </Row>
                        </Col>
                        <Col lg='4'>
                            <GameChat />
                        </Col>
                    </Row>
                </Container>
            </div>

            <Footer />
        </div>
    );
}
