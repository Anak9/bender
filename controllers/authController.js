const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

// returns a json web token
const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, req, res, statusCode) => {
  const token = createToken(user.id);

  const cookieOptions = {
    maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    httpOnly: true, // cookie cant be modified by the browser
    secure: req.secure, // cookie can only be sent in a encrypted connection (https)
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined; // remove from output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const userObj = {
    name: req.body.name,
    email: req.body.email,
    bending: req.body.bending,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  // if (!req.body.passwordConfirm)
  //   return next(new AppError('Please confirm your password', 400));

  const newUser = await User.create(userObj);

  createAndSendToken(newUser, req, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exists
  if (!email) return next(new AppError('Please enter your email', 400));
  if (!password) return next(new AppError('Please enter your password', 400));

  // check if user exists and if password is correct
  const user = await User.findOne({ email }).select('+password'); // password is not returned by default
  if (!user || !(await User.verifyPassword(password, user.password)))
    return next(new AppError('Invalid email or password', 401));

  // send jwt token to client
  createAndSendToken(user, req, res, 200);
});

// reset json web token cookie
exports.logout = (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 1),
    httpOnly: true, // cookie cant be modified by the browser,
  };

  res.cookie('jwt', ' ', cookieOptions);

  res.status(200).json({
    status: 'success',
  });
};

// grant access to logged in users only
exports.protect = catchAsync(async (req, res, next) => {
  // Check if token exists
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(new AppError('Must be logged in to access this resource', 401));

  // Validating token
  const decodedResult = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check if user still exists
  const user = await User.findById(decodedResult.id);
  if (!user) return next(new AppError('This user no longer exists', 401));

  // Check if user changed password after token was issued
  if (user.passwordChangedAfter(decodedResult.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again', 401)
    );
  }

  // grant access
  req.user = user; // usefull to restricTo and updatePassword
  res.locals.user = user;
  next();
});

// make user available in views
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // check if token is valid
      const result = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // Check if user still exists
      const user = await User.findById(result.id);

      // Check if user changed password after token was issued
      if (!user || user.passwordChangedAfter(result.iat)) return next();

      res.locals.user = user;
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (roles) => (req, res, next) => {
  if (roles.split(' ').find((role) => role === req.user.role)) return next();

  return next(
    new AppError(
      'Forbidden. You do not have permission to access this resource',
      403
    )
  );
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Find user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next('Something went wrong when trying to find this email', 404);

  // Generate random reset token
  const token = user.createPasswordResetToken();

  // fn above modifies some doc values (check userModel). Need to save them
  await user.save({ validateBeforeSave: false });

  // Send token to user's email
  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${token}`;
  const text = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${url}\nValid for 10 minutes.\nIf you did not request a password change, please ignore this email.`;

  try {
    await sendEmail(text, user.email, 'Your reset password token');

    res.status(200).json({
      status: 'success',
      message: 'A link was sent to your email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    next('There was an error sending the email. Please try again later', 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Search for the user using token value and, if the user is found, check if token has expired
  const token = User.hashString(req.params.token);
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError('Invalid token or token has expired', 400));

  // Set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Log user in
  createAndSendToken(user, req, res, 200);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // explicitly select password
  const user = await User.findById(req.user.id).select('+password');

  // Check if POSTed password is correct
  if (!(await User.verifyPassword(req.body.password, user.password)))
    return next(new AppError('Incorrect password', 401));

  if (!req.body.newPassword)
    return next(new AppError('Please enter a new password', 400));

  //update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log the user in - send JWT
  createAndSendToken(req.user, req, res, 200);
});
