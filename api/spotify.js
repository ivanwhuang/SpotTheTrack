const axios = require('axios');
const request = require('request');
const express = require('express');
const fs = require('fs');
const router = express.Router();

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
  let token = fs.readFileSync(
    '.env.development.local', 
    {
      encoding: 'utf8',
      flag: 'r'
  });
  let url = "https://api.spotify.com/v1/search";
  let query = {
    q: 'illenium',
    type: 'track',
    limit: '1'
  };

  // NOTE: prototype for choosing a random artist
  let artists = Array("Said%20the%20sky", "illenium", "dabin", "Calvin%20Harris");
  let rand_keyword = artists[Math.floor(Math.random() * artists.length)];

  request.get(
    `https://api.spotify.com/v1/search?q=${rand_keyword}&type=track&limit=1&market=US`, 
    {
      'auth': {
        'bearer': token
    }
  }, (error, response, body) => {
    if (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }

    if (response.statusCode == 200) {
      // TODO: filter for preview url and append to json response along with name
      let bodyAsJson = JSON.parse(body);
      // console.log(bodyAsJson['tracks']['items'][0]['preview_url']);
      res.json(
        JSON.stringify(
          {
            "name": bodyAsJson['tracks']['items'][0]['name'],
            "preview": bodyAsJson['tracks']['items'][0]['preview_url']
          })
      );
    }
    else {
      console.error(`Error: ${response.statusCode}`);
      res.status(response.statusCode).send('Request Error');
    }
    
  });
});

module.exports = router;
