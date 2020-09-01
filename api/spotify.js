const axios = require('axios');

const express = require('express');
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

module.exports = router;
