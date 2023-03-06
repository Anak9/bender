const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'A booking must have a teacher'],
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A booking must have a user'],
  },

  price: {
    type: Number,
    required: [true, 'A booking must have a price'],
  },

  date: {
    type: Date,
    required: [true, 'A booking must have a date'],
  },

  time: {
    type: String,
    required: [true, 'A booking must have a time'],
  },

  bookedAt: {
    type: Date,
    default: Date.now(),
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'teacher',
    select: 'name bending type modality',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
