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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

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
      let url = `https://api.spotify.com/v1/search?query=${q}&type=${type}&limit=${limit}&offset=${offset*limit}`;
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

  let artists = queryString.parse(req.query.artists, { arrayFormat: 'bracket' })
    .artists;
  let limit = queryString.parse(req.query.limit).limit || '20';
  let searchLimit = '30';
  let offset = 3;
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
      filteredItems.forEach((item) =>
        item.forEach((track) => {
          // remove tracks that don't contain an artist from 'artists'
          if (track.artists.find((artist) => artists.includes(artist.name)) != null) {
            allTracks.push(track);
          }
        })
      );

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

          if (tracks.find((track) => track.name === name)) {
            continue;
          } else {
            artistsInSong = [];
            for (let a of randomTrack.artists) {
              artistsInSong.push(a.name);
            }
            if (randomTrack.preview_url !== null) {
              let hint1Index = getRandomInt(Math.floor(name.length / 2));

              while (name[hint1Index].match(/^[0-9a-zA-Z]$/) == null) {
                hint1Index = getRandomInt(Math.floor(name.length / 2));
              }

              let hint2Index =
                getRandomInt(Math.floor(name.length) / 2) +
                Math.floor(name.length / 2);

              while (
                hint2Index == hint1Index ||
                name[hint2Index].match(/^[0-9a-zA-Z]$/) == null
              ) {
                hint2Index =
                  getRandomInt(Math.floor(name.length / 2)) +
                  Math.floor(name.length / 2);
              }

              let noHintStr = '';
              let hintStr1 = '';
              let hintStr2 = '';
              for (let i = 0; i < name.length; i++) {
                if (i == hint1Index) {
                  noHintStr += '_';
                  hintStr1 += name[i];
                  hintStr2 += name[i];
                } else if (i == hint2Index) {
                  noHintStr += '_';
                  hintStr1 += '_';
                  hintStr2 += name[i];
                } else if (name[i].match(/^[0-9a-zA-Z]$/) == null) {
                  noHintStr += name[i];
                  hintStr1 += name[i];
                  hintStr2 += name[i];
                } else {
                  noHintStr += '_';
                  hintStr1 += '_';
                  hintStr2 += '_';
                }
              }

              let track = {
                name: name,
                artwork: randomTrack.album.images[0].url,
                artists: randomTrack.artists,
                preview: randomTrack.preview_url,
                url: randomTrack.external_urls.spotify,
                noHintStr: noHintStr,
                hintStr1: hintStr1,
                hintStr2: hintStr2,
              };
              tracks.push(track);
            }
          }
        }
        // console.log(tracks);
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
