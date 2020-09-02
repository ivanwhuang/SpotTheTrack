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
// @desc    Returns the name of a spotify track with 'drake' as keyword
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
    q: 'drake',
    type: 'track',
    limit: '1'
  };

  request.get('https://api.spotify.com/v1/search?q=drake&type=track&limit=1', {
    'auth': {
      'bearer': token
    }
  }, (error, response, body) => {
    if (error) {
      console.error(error);
      res.status(500).send('Server Error')
    }

    // TODO: filter for preview url and append to json response along with name
    let bodyAsJson = JSON.parse(body);
    console.log(bodyAsJson['tracks']['items'][0]['name']);
    res.json(JSON.stringify({"name": bodyAsJson['tracks']['items'][0]['name']}));
  });
});

module.exports = router;
