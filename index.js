const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/spotify', require('./api/spotify'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
