const express = require('express');
const config = require('./config');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.env} mode`);
});