import '../styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-h5-audio-player/lib/styles.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import 'react-multi-carousel/lib/styles.css';

import Header from '../components/header.js';
import Footer from '../components/footer.js';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}

export default MyApp;
