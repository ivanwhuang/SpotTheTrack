const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const Spotify = require('node-spotify-api');

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/spotify', require('./api/spotify'));

// FOR JESSE LEE - example spotify search
var spotify = new Spotify({
    id: process.env.SPOTIFY_CLIENT,
    secret: process.env.SPOTIFY_SECRET,
});

spotify.search(
    {
        type: 'track',
        query: 'Without you Avicii',
    },
    function (err, data) {
        if (err) {
            return console.log('Error occured:' + err);
        }
        console.log(data);
    }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
