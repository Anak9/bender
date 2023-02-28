const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },

  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: [true, 'This email adress already exists'],
    validate: [validator.isEmail, 'Please enter a valid email'],
  },

  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'teacher-aide'],
  },

  bending: {
    type: String,
    required: [true, 'Please inform your bending'],
    enum: {
      values: ['air', 'water', 'earth', 'fire'],
      message: 'Bending must be either: air, water, earth or fire',
    },
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  photo: {
    type: String,
    default: 'default.jpg',
  },

  password: {
    type: String,
    select: false,
    required: [true, 'Please provide a password'],
    minLength: [6, 'Passwords must be at least 6 characters'],
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // only works on CREATE and SAVE
      validator: function (value) {
        if (value.localeCompare(this.password) !== 0) return false;
        return true;
      },
      message: 'Passwords are not the same',
    },
  },

  passwordChangedAt: Date,

  passwordResetToken: String,

  passwordResetExpires: Date,
});

// inactive users should not be returned
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// password encryption (hashing)
userSchema.pre('save', async function (next) {
  // only run if password was actually modified
  if (this.isModified('password')) {
    try {
      // hash the password with cost of 12
      this.password = await bcrypt.hash(this.password, 12);
    } catch (err) {
      return next(err);
    }

    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.pre('save', function (next) {
  // subtract 1 second is important because this operation takes a long time do finish
  if (this.isModified('password') && !this.isNew)
    this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.passwordChangedAfter = function (JWTiat) {
  if (this.passwordChangedAt) {
    const dateChange = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return dateChange > JWTiat;
  }
};

// returns a promise with compare result
userSchema.statics.verifyPassword = async (givenPassword, realPassword) =>
  await bcrypt.compare(givenPassword, realPassword);

userSchema.statics.hashString = (string) =>
  crypto.createHash('sha256').update(string).digest('hex');

// generates a token to allow password change
userSchema.methods.createPasswordResetToken = function () {
  const randomStr = crypto.randomBytes(32).toString('hex');
  const token = this.contructor.hashString(randomStr);

  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // we save the encrypted version, and send the not encryted version to the user's email
  return randomStr;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
