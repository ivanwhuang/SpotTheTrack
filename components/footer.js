import { Navbar, Nav } from 'react-bootstrap';
import Link from 'next/Link';

export default function Footer() {
    return (
        <div className='footer'>
            <h4>
                SpotTheTrack By{' '}
                <a
                    href='https://ivanwhuang.me/'
                    target='_blank'
                    className='footer-link'
                >
                    Ivan Huang
                </a>{' '}
                and{' '}
                <a
                    href='https://github.com/butler-jelee21'
                    target='_blank'
                    className='footer-link'
                >
                    Jesse Lee
                </a>
            </h4>
            <div>
                View on{' '}
                <a
                    href='https://github.com/younghuangbao/SpotTheTrack'
                    target='_black'
                    className='footer-link'
                >
                    Github <i class='fa fa-github'></i>
                </a>
            </div>
        </div>
    );
}
