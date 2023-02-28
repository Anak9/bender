const dotenv = require('dotenv');
const mongoose = require('mongoose');

// access to config.env
dotenv.config({ path: './config.env' }); // needs to come before require app

const app = require('./app');

// CONNECT TO DATABASE
const database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', false);
mongoose
  .connect(database)
  .then(() => console.log('database connection successful!'));

// START THE SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
