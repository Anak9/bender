const dotenv = require('dotenv');
const mongoose = require('mongoose');

// SAFETY NET - uncaught Exception
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

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
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// SAFETY NET - unhandled promises rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);

  // exiting the application gracefully - closing the server first before exiting
  server.close(() => {
    process.exit(1);
  });
});
