const express = require('express');
const pool = require('./database');
const cors = require('cors')


const port = process.env.PORT || 3000;
const app = express();

app.get('/', (req, res) => {
  res.send('Tere tulemast backend’i!');
});

app.listen(PORT, () => {
  console.log(`Server töötab pordil ${PORT}`);
});