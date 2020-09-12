const axios = require('axios');
const request = require('request');
const express = require('express');
const dotenv = require('dotenv').config();
const Spotify = require('node-spotify-api');
const queryString = require('query-string');
const router = express.Router();

var spotify = new Spotify({
  id: process.env.SPOTIFY_CLIENT,
  secret: process.env.SPOTIFY_SECRET,
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

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
// @access  Public
router.get('/initializeGameState', async (req, res) => {
  const chooseRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length) % arr.length];
  };

  const search = (type, query, limit) => {
    return new Promise((resolve, reject) => {
      spotify
        .search({
          type: type,
          query: query,
          limit: limit,
        })
        .then((response) => resolve(response))
        .catch((err) => reject(err));
    })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        console.error(err);
        return err;
      });
  };

  let artists = queryString.parse(req.query.artists, { arrayFormat: 'bracket' })
    .artists;
  let limit = queryString.parse(req.query.limit).limit || '20';
  let searchLimit = '20';

  Promise.all(artists.map((artist) => search('track', artist, searchLimit)))
    .then((allData) => {
      let items = allData.map((result) => result.tracks.items);
      let tracks = [];
      let filteredItems = items.map((item) =>
        item.filter((track) => track.preview_url !== null)
      );
      let ctr = 0;
      filteredItems.forEach((item) => (ctr += item.length));

      if (ctr < limit) {
        res.json(
          JSON.stringify({
            error: 'Tracks received less than limit provided.',
          })
        );
      } else {
        while (tracks.length < limit) {
          let randomArtists = chooseRandom(filteredItems);
          let randomTrack = chooseRandom(randomArtists);
          let name = randomTrack.name.toString().split('(')[0].trim();
          if (tracks.find((track) => track.name === name)) {
            continue;
          } else {
            artistsInSong = [];
            for (let a of randomTrack.artists) {
              artistsInSong.push(a.name);
            }
            if (randomTrack.preview_url !== null) {
              let hint1 = getRandomInt(randomTrack.name.length);
              let hint2 = getRandomInt(randomTrack.name.length);
              while (hint1 == hint2) {
                hint2 = getRandomInt(randomTrack.name.length);
              }

              let track = {
                name: name,
                artists: randomTrack.artists,
                preview: randomTrack.preview_url,
                hint1: hint1,
                hint2: hint2,
              };
              tracks.push(track);
            }
          }
        }
        console.log(tracks);
        res.json(
          JSON.stringify({
            tracks: tracks,
          })
        );
      }
    })
    .catch((err) => console.error(err));
});

// @route   GET api/spotify/searchArtist
// @desc    Returns a list of 3 artists upon a search keyword from Spotify
// @access  Public
router.get('/searchArtist/:keyword', async (req, res) => {
  try {
    let limit = 3;
    const result = await spotify.search({
      type: 'artist',
      query: req.params.keyword,
      limit: limit,
    });

    res.json(result['artists']['items']);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
