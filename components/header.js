import Head from 'next/head';

import { Navbar, Nav } from 'react-bootstrap';
import Link from 'next/link';

export default function Header() {
    return (
        <div>
            <Head>
                <title>SpotTheTrack</title>
                <meta
                    name='viewport'
                    content='initial-scale=1.0, width=device-width'
                />
                <link
                    rel='stylesheet'
                    href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'
                    integrity='sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T'
                    crossorigin='anonymous'
                ></link>
                <link
                    rel='stylesheet'
                    href='https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
                />
            </Head>
            <Navbar
                sticky='top'
                expand='lg'
                bg='dark'
                variant='dark'
                className='header'
            >
                <Navbar.Brand style={{ 'font-size': '1.8rem' }}>
                    <i className='fa fa-spotify'></i>
                    &nbsp; SpotTheTrack
                </Navbar.Brand>
            </Navbar>
        </div>
    );
}
