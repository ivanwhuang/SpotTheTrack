import Header from '../components/header.js';
import Footer from '../components/footer.js';

import { Container, Row, Col, Button, Form } from 'react-bootstrap';

import Link from 'next/Link';

export default function SoloGame() {
    return (
        <div>
            <Header />
            <div className='game-background'>
                <Container>
                    <h1 style={{ color: 'white' }}>Guess The Song!</h1>
                    <Row>
                        <Col>
                            <img
                                src='/images/thinking.png'
                                alt='thinking'
                            ></img>
                        </Col>
                        <Col></Col>
                        <Col></Col>
                    </Row>
                </Container>
            </div>

            <Footer />
        </div>
    );
}
