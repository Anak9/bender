// for handlings errors better
// this will allow us to send the error status to the error middleware and not just the message
// and mark errors as operational

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;

    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';

    // only operational errors are sent to client
    this.isOperational = true;

    Error.captureStackTrace(this, this.contructor);
  }
}

module.exports = AppError;
