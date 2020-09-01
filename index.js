const express = require('express');

const app = express();

app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/spotify', require('./api/spotify'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
