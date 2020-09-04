import Header from '../components/header.js';
import Footer from '../components/footer.js';

import Link from 'next/link';

import { Container, Row, Col, Button, Form } from 'react-bootstrap';

export default function Home() {
    return (
        <div>
            <Header />
            <div className='landing-background'>
                <Container className='landing-main'>
                    <Row>
                        <Col lg={9}>
                            <h1 className='intro-text'>
                                Can you SpotTheTrack?
                            </h1>
                        </Col>
                        <Col lg={3} style={{}}>
                            <Form>
                                <Form.Group
                                    controlId='nameForRoom'
                                    className='landing-button'
                                >
                                    <Form.Control
                                        type='text'
                                        placeholder='Name'
                                        size='lg'
                                    />
                                </Form.Group>
                                <Link href='/#'>
                                    <Button
                                        className='landing-button'
                                        size='lg'
                                        variant='info'
                                    >
                                        Host A Game
                                    </Button>
                                </Link>
                                <Link href='/#'>
                                    <Button
                                        className='landing-button'
                                        size='lg'
                                        variant='secondary'
                                    >
                                        Find A Game
                                    </Button>
                                </Link>
                                <Link href='/soloGame'>
                                    <Button
                                        className='landing-button'
                                        size='lg'
                                        variant='success'
                                    >
                                        Play By Myself
                                    </Button>
                                </Link>
                            </Form>
                        </Col>
                    </Row>
                    {/* <div
                        style={{
                            color: 'white',
                            'font-size': '50px',
                            'margin-top': '2rem',
                        }}
                    >
                        <p style={{ 'text-align': 'center' }}>
                            <i class='fa fa-arrow-down' aria-hidden='true'></i>
                            &nbsp; Rules &nbsp;
                            <i class='fa fa-arrow-down' aria-hidden='true'></i>
                        </p>
                    </div> */}
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
                            <div style={{ 'margin-top': '1rem' }}>
                                Each Round ....
                            </div>
                        </Col>
                        <Col className='rule-col'>
                            <img
                                src='/images/placeholder.png'
                                alt='rules1'
                                style={{ width: '90%' }}
                            ></img>
                            <div style={{ 'margin-top': '1rem' }}>
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
                            <div style={{ 'margin-top': '1rem' }}>
                                Clues will be given out periodically.
                            </div>
                        </Col>
                        <Col className='rule-col'>
                            <img
                                src='/images/placeholder.png'
                                alt='rules1'
                                style={{ width: '90%' }}
                            ></img>
                            <div style={{ 'margin-top': '1rem' }}>
                                Winner goes to player with the most points
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Footer />
        </div>
    );
}
