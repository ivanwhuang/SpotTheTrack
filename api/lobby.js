const express = require('express');
const axios = require('axios');
const router = express.Router();

const index = require('../index');

// @route   GET api/spotify
// @desc    Sample route for Jesse Lee
// @access  Private
router.get('/isValidRoom/:room', async (req, res) => {
  try {
    if (req.params.room in index.rooms) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
