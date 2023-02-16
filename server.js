const dotenv = require('dotenv');
// const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

// connect to database

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
