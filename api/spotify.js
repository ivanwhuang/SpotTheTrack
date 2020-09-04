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

// @route   GET api/spotify/gettrack
// @desc    Returns the name and preview url of a spotify track 
//          with a random keyword from a predefined list
// @access  Private
router.get('/gettrack', (req, res) => {
  
  // NOTE: prototype for choosing a random artist
  let artists = Array("Said the sky", "illenium", "dabin", "Calvin Harris");
  let rand_keyword = artists[Math.floor(Math.random() * artists.length)];
  console.log(rand_keyword);
  spotify.search(
    {
      type: 'track',
      query: `${rand_keyword}`,
      limit: '1',
    },
    function (err, data) {
      if (err) {
        return console.log('Error occured:' + err);
      }
      // console.log(data['tracks']['items'][0]['preview_url']);
      let name = data['tracks']['items'][0]['name'].toString();
      let filteredName = name.split("(");
      console.log(name, filteredName);
      let preview = data['tracks']['items'][0]['preview_url'];
      res.json(
        JSON.stringify(
        {
          "name": filteredName[0].trim(),
          "preview": preview,
        })
      );
    }
  );
});

module.exports = router;
