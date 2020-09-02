import Header from '../components/header.js';

import Link from 'next/Link';

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
                            </Form>
                        </Col>
                    </Row>
                    <div
                        style={{
                            'font-size': '110px',
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
                    </div>
                </Container>
            </div>
        </div>
    );
}
