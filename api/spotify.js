const axios = require('axios');
const request = require('request');
const express = require('express');
const dotenv = require('dotenv').config();
const Spotify = require('node-spotify-api');
const queryString = require('query-string');
const router = express.Router();
const assert = require('assert');

var spotify = new Spotify({
  id: process.env.SPOTIFY_CLIENT,
  secret: process.env.SPOTIFY_SECRET,
});

// generate random integer between min and max (max not inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// source: https://stackoverflow.com/a/6274381
const shuffle = (a) => {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
};

const chooseRandom = (arr) => {
  return arr[Math.floor(Math.random() * arr.length) % arr.length];
};

const urlSearch = (type, query, limit, offset) => {
  return new Promise((resolve, reject) => {
    let q = query.replace(/\s/g, '+');
    let url = `https://api.spotify.com/v1/search?query=${q}&type=${type}&limit=${limit}&offset=${
      offset * limit
    }`;
    spotify
      .request(url)
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
  let artists = queryString.parse(req.query.artists, { arrayFormat: 'bracket' })
    .artists;
  let limit = queryString.parse(req.query.limit).limit || '20';
  let searchLimit = '30';
  let offset = 5;
  let reqs = [];

  for (let idx = 0; idx < offset; ++idx) {
    artists.forEach((artist) => {
      reqs.push(urlSearch('track', artist, searchLimit, idx));
    });
  }

  Promise.all(reqs)
    .then((allData) => {
      let items = allData.map((result) => result.tracks.items);
      let tracks = [];
      let filteredItems = items.map((item) =>
        item.filter((track) => track.preview_url !== null)
      );

      let allTracks = [];
      let memory = new Set();
      let numTracks = 0;
      filteredItems.forEach((item) =>
        item.forEach((track) => {
          numTracks++;
          // remove duplicates and tracks that don't contain an artist from 'artists'
          if (
            track.artists.find((artist) => artists.includes(artist.name)) !=
            null
          ) {
            let tmpName = track.name
              .toString()
              .toLowerCase()
              .split(/(\(.*|\s-\s.*|f(ea)?t.*)/)[0]
              .trim();
            if (!memory.has(tmpName)) {
              console.log(tmpName);
              allTracks.push(track);
              memory.add(tmpName);
            }
          }
        })
      );

      // log parsing statistics
      console.log(`${numTracks} tracks contain a preview_url`);
      console.log(`${numTracks - allTracks.length} are garbage`);

      let shuffledTracks = shuffle(allTracks);
      if (shuffledTracks.length < limit) {
        res.json(
          JSON.stringify({
            error: 'Tracks received less than limit provided.',
          })
        );
      } else {
        while (tracks.length < limit) {
          let randomTrack = chooseRandom(shuffledTracks);
          let name = randomTrack.name
            .toString()
            .split(/(\(.*|\s-\s.*|f(ea)?t.*)/)[0]
            .trim();
          console.log(`selected ${name}`);
          if (tracks.find((track) => track.name === name)) {
            continue;
          } else {
            artistsInSong = []; // is this being used anywhere?
            for (let a of randomTrack.artists) {
              artistsInSong.push(a.name);
            }
            if (randomTrack.preview_url !== null) {
              let hints = {
                noHintStr: '',
                hintStr1: '',
                hintStr2: '',
                hintStr3: '',
                hintStr4: '',
                hintStr5: '',
              };

              let numHints = 0;
              let hintIndices = [-1, -1, -1, -1, -1];

              if (name.length <= 2) {
                numHints = 0;
              } else if (name.length >= 3 && name.length <= 4) {
                numHints = 1;
              } else if (name.length >= 5 && name.length <= 7) {
                numHints = 2;
              } else if (name.length >= 8 && name.length <= 10) {
                numHints = 3;
              } else if (name.length >= 11 && name.length <= 13) {
                numHints = 4;
              } else {
                numHints = 5;
              }

              // A threshold to decide when to give up trying to generate hints
              // useful for when a song's title contains only non-alphanumeric characters
              let maxLoopCounter = 15;

              // won't generate hint indices if length of song name is <= 2
              for (let i = 0; i < numHints; i++) {
                let newHintIndex = getRandomInt(0, name.length);
                let loopCounter = 0;
                while (
                  hintIndices.includes(newHintIndex) ||
                  name[newHintIndex].match(/^[0-9a-zA-Z]$/) == null
                ) {
                  newHintIndex = getRandomInt(0, name.length);
                  loopCounter++;
                  // adjust numHints accordingly if loop fails to find an alpha-numeric index
                  if (loopCounter === maxLoopCounter) {
                    numHints = i;
                    break;
                  }
                }
                hintIndices[i] = newHintIndex;
              }

              for (let i = 0; i < name.length; i++) {
                if (name[i].match(/^[0-9a-zA-Z]$/) == null) {
                  hints['noHintStr'] += name[i];
                  for (let n = 0; n < numHints; n++) {
                    hints['hintStr' + (n + 1)] += name[i];
                  }
                } else if (i == hintIndices[0]) {
                  hints['noHintStr'] += '_';
                  for (let n = 0; n < numHints; n++) {
                    hints['hintStr' + (n + 1)] += name[i];
                  }
                } else if (i == hintIndices[1]) {
                  hints['noHintStr'] += '_';
                  for (let n = 0; n < numHints; n++) {
                    if (n <= 0) {
                      hints['hintStr' + (n + 1)] += '_';
                    } else {
                      hints['hintStr' + (n + 1)] += name[i];
                    }
                  }
                } else if (i == hintIndices[2]) {
                  hints['noHintStr'] += '_';
                  for (let n = 0; n < numHints; n++) {
                    if (n <= 1) {
                      hints['hintStr' + (n + 1)] += '_';
                    } else {
                      hints['hintStr' + (n + 1)] += name[i];
                    }
                  }
                } else if (i == hintIndices[3]) {
                  hints['noHintStr'] += '_';
                  for (let n = 0; n < numHints; n++) {
                    if (n <= 2) {
                      hints['hintStr' + (n + 1)] += '_';
                    } else {
                      hints['hintStr' + (n + 1)] += name[i];
                    }
                  }
                } else if (i == hintIndices[4]) {
                  hints['noHintStr'] += '_';
                  for (let n = 0; n < numHints; n++) {
                    if (n <= 3) {
                      hints['hintStr' + (n + 1)] += '_';
                    } else {
                      hints['hintStr' + (n + 1)] += name[i];
                    }
                  }
                } else {
                  hints['noHintStr'] += '_';
                  for (let n = 0; n < numHints; n++) {
                    hints['hintStr' + (n + 1)] += '_';
                  }
                }
              }

              let track = {
                name: name,
                artwork: randomTrack.album.images[0].url,
                artists: randomTrack.artists,
                preview: randomTrack.preview_url,
                url: randomTrack.external_urls.spotify,
                hints: hints,
                numHints: numHints,
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
