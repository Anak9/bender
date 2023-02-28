const AppError = require('../utils/AppError');

const createJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.');

const createJWTError = () =>
  new AppError('Invalid Json Web Token. Please log in again.', 401);

const createCastErrorDB = (error) => new AppError(`Invalid ${error.path}`, 404);

const createValidationErrorDB = (error) => {
  const errorObj = Object.values(error.errors).map((el) => el.message);

  return new AppError(`Missing or invalid input data. ${errorObj[0]}`, 400);
};

const createduplicateKeyErrorDB = (error) => {
  const fieldName = Object.keys(error.keyValue);

  return new AppError(
    `Duplicate field value. This ${fieldName} already exists in our database, please choose a different one`,
    400
  );
};

const sendErrorProd = (error, req, res) => {
  console.log('ERROR ', error);
  // request to API
  if (req.originalUrl.startsWith('/api')) {
    // OPERATIONAL error
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    // PROGRAMMING or unknown error
    return res.status(500).json({
      status: 'error',
      message: 'Sorry, something went wrong. Please try again later.',
    });
  }

  // request from WEBSITE

  // OPERATIONAL error
  if (error.isOperational) {
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong',
      message: error.message,
    });
  }

  // PROGRAMMING or unknown error
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong',
    message: 'Please try again later',
  });
};

const sendErrorDev = (error, req, res) => {
  console.log('ERROR ', error);
  // request to API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(error.statusCode).json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack,
    });
  }

  // request from WEBSITE
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong',
    message: error.message,
  });
};

const ErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // default value = 500 (internal server error) if undefined
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
    //
  } else {
    //
    let error = { name: err.name, ...err }; // hard copy
    error.message = err.message;

    if (error.name === 'ValidationError')
      error = createValidationErrorDB(error);

    if (error.name === 'CastError') error = createCastErrorDB(error);

    if (error.code === 11000) error = createduplicateKeyErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = createJWTError();

    if (error.name === 'TokenExpiredError') error = createJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

module.exports = ErrorHandler;
