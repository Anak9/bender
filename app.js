const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

const teacherRouter = require('./routes/teacherRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const ErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/AppError');

const app = express();

// PARSE
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// SECURITY
const safeFonts = [
  "'self'",
  'fonts.googleapis.com/*',
  'fonts.googleapis.com/',
  'googleapis.com/*',
  'googleapis.com/',
  'fonts.gstatic.com',
  'tile.openstreetmap.org',
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      // defaultSrc: ['*', "'unsafe-inline'"],
      // "script-src": ['*', "'unsafe-inline'"],
      // "style-src": ['*', "'unsafe-inline'"],
      'font-src': safeFonts,
      'img-src': ['*', "'unsafe-inline'", 'blob:'],
      // "form-action":[ '*', "'unsafe-inline'"]
    },
  })
);

// http
//

// routes mouting middleware
app.use('/', viewRouter);
app.use('/api/v1/teachers', teacherRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Could not find ${req.originalUrl} in our server`, 404));
});

// error handler middleware
app.use(ErrorHandler);

module.exports = app;
