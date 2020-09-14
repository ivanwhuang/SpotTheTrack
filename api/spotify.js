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
  return Math.floor(Math.random() * max);
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
      // console.log(filteredItems, ctr);
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
          // console.log(randomTrack.album.images[0].url);
          let name = randomTrack.name
            .toString()
            .split(/(\(.*|\s-\s.*)/)[0]
            .trim();
          if (tracks.find((track) => track.name === name)) {
            continue;
          } else {
            artistsInSong = [];
            for (let a of randomTrack.artists) {
              artistsInSong.push(a.name);
            }
            if (randomTrack.preview_url !== null) {
              let hint1Index = getRandomInt(Math.floor(name.length / 2));
              while (name[hint1Index] === ' ' || name[hint1Index] === '-') {
                hint1Index = getRandomInt(Math.floor(name.length / 2));
              }

              let hint2Index =
                getRandomInt(Math.floor(name.length) / 2) +
                Math.floor(name.length / 2);

              while (name[hint2Index] === ' ' || name[hint1Index] === '-') {
                hint2Index =
                  getRandomInt(Math.floor(name.length / 2)) +
                  Math.floor(name.length / 2);
              }

              let noHintStr = [];
              let hintStr1 = [];
              let hintStr2 = [];
              for (let i = 0; i < name.length; i++) {
                if (i == hint1Index) {
                  noHintStr.push('_');
                  hintStr1.push(name[i]);
                  hintStr2.push(name[i]);
                } else if (i == hint2Index) {
                  noHintStr.push('_');
                  hintStr1.push('_');
                  hintStr2.push(name[i]);
                } else if (name[i] === ' ') {
                  noHintStr.push(' ');
                  hintStr1.push(' ');
                  hintStr2.push(' ');
                } else if (name[i] === '-') {
                  noHintStr.push('-');
                  hintStr1.push('-');
                  hintStr2.push('-');
                } else {
                  noHintStr.push('_');
                  hintStr1.push('_');
                  hintStr2.push('_');
                }
              }

              let track = {
                name: name,
                artwork: randomTrack.album.images[0].url,
                artists: randomTrack.artists,
                preview: randomTrack.preview_url,
                noHintStr: noHintStr,
                hintStr1: hintStr1,
                hintStr2: hintStr2,
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
