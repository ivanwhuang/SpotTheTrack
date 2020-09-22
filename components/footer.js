import { Navbar, Nav } from 'react-bootstrap';
import Link from 'next/link';

import styles from '../styles/components/Footer.module.css';

export default function Footer() {
  return (
    <div className={styles.footer}>
      <h4>
        SpotTheTrack By{' '}
        <a
          href='https://ivanwhuang.me/'
          target='_blank'
          className={styles.footerLink}
        >
          Ivan Huang
        </a>{' '}
        and{' '}
        <a
          href='https://www.linkedin.com/in/jesselee615'
          target='_blank'
          className={styles.footerLink}
        >
          Jesse Lee
        </a>
      </h4>
      <div>
        View on{' '}
        <a
          href='https://github.com/younghuangbao/SpotTheTrack'
          target='_black'
          className={styles.footerLink}
        >
          Github <i className='fa fa-github'></i>
        </a>
      </div>
    </div>
  );
}
