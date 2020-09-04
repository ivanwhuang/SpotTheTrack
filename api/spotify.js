const axios = require('axios');
const request = require('request');
const express = require('express');
const dotenv = require('dotenv').config();
const Spotify = require('node-spotify-api');
const router = express.Router();

var spotify = new Spotify({
  id: process.env.SPOTIFY_CLIENT,
  secret: process.env.SPOTIFY_SECRET,
});

// @route   GET api/spotify
// @desc    Sample route for Jesse Lee
// @access  Private
router.get('/test', async (req, res) => {
  try {
    const result = await axios.get('http://numbersapi.com/5/math');
    res.json(result.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// NOTE: DEPRECATED--USE api/spotify/initializeGameState
// @route   GET api/spotify/gettrack
// @desc    Returns the name and preview url of a spotify track
//          with a random keyword from a predefined list
// @access  Private
router.get('/gettrack', (req, res) => {
  // NOTE: prototype for choosing a random artist
  let artists = Array('Said the sky', 'illenium', 'dabin', 'Calvin Harris');
  let rand_keyword = artists[Math.floor(Math.random() * artists.length)];

  let limit = '20';
  spotify.search(
    {
      type: 'track',
      query: `${rand_keyword}`,
      limit: limit,
    },
    function (err, data) {
      if (err) {
        return console.log('Error occured:' + err);
      }

      let tracksReceived = data['tracks']['items'];
      let tracks = [];
      for (let idx = 0; idx < limit; idx++) {
        if (tracksReceived[idx]['preview_url'] !== null) {
          let name = data['tracks']['items'][idx]['name'].toString();
          let filteredName = name.split('(')[0].trim();
          let track = {
            name: filteredName,
            preview: tracksReceived[idx]['preview_url'],
          };
          tracks.push(track);
        }
      }

      res.json(
        JSON.stringify({
          name: tracks[0].name,
          preview: tracks[0].preview,
        })
      );
    }
  );
});

// @route   GET api/spotify/initializeGameState
// @desc    Returns a list of tracks necessary for the game
//          to be played
// @access  Private
router.get('/initializeGameState', (req, res) => {
  // NOTE: prototype for choosing a random artist
  let artists = Array('Said the sky', 'illenium', 'dabin', 'Calvin Harris');
  let rand_keyword = artists[Math.floor(Math.random() * artists.length)];

  let limit = '20';
  spotify.search(
    {
      type: 'track',
      query: `${rand_keyword}`,
      limit: limit,
    },
    function (err, data) {
      if (err) {
        return console.log('Error occured:' + err);
      }

      let tracksReceived = data['tracks']['items'];
      let tracks = [];
      for (let idx = 0; idx < limit; idx++) {
        if (tracksReceived[idx]['preview_url'] !== null) {
          let name = data['tracks']['items'][idx]['name'].toString();
          let filteredName = name.split('(')[0].trim();
          let track = {
            name: filteredName,
            preview: tracksReceived[idx]['preview_url'],
          };
          tracks.push(track);
        }
      }

      res.json(
        JSON.stringify({
          tracks: tracks,
        })
      );
    }
  );
});

module.exports = router;
