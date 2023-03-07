const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const teacherRouter = require('./routes/teacherRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const bookingController = require('./controllers/bookingController');

const ErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/AppError');

const app = express();

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
      'script-src': ['*', "'unsafe-inline'", 'https://js.stripe.com/v3/'],
      'frame-src': ["'self'", 'https://js.stripe.com/'],
      // "style-src": ['*', "'unsafe-inline'"],
      'font-src': safeFonts,
      'img-src': ['*', "'unsafe-inline'", 'blob:'],
      // "form-action":[ '*', "'unsafe-inline'"]
    },
  })
);

const limiter = rateLimit({
  max: 100, // allows 100 request per hour for each IP address
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in a hour',
});

app.use('/api', limiter);

// gets req.body in raw format, not json
app.post(
  'webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// PARSE
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injections *
app.use(mongoSanitize());

// Data sanitization against XSS (cross-site scripting) attacks
app.use(xss());

// Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'modality',
      'ratingsAverage',
      'ratingsQuantity',
      'groupSize',
      'groupClasses',
      'type',
      'price',
    ],
  })
);

app.use(compression());

// routes mouting middleware
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/teachers', teacherRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Could not find ${req.originalUrl} in our server`, 404));
});

// error handler middleware
app.use(ErrorHandler);

module.exports = app;
