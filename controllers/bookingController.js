const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Teacher = require('../models/teacherModel');

exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const teacher = await Teacher.findById(req.params.teacherId);

  const firstLetter = teacher.bending.split('')[0].toUpperCase();
  const name = `${firstLetter + teacher.bending.slice(1)} bending class`;

  const date = new Date(req.params.date).toLocaleDateString('en-us', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Create Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?teacher=${
      req.params.teacherId
    }&user=${req.user.id}&price=${teacher.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/teacher/${teacher.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.teacherId,

    line_items: [
      {
        /*images: ['www.websiteDomain.com']*/
        price_data: {
          currency: 'usd',
          product_data: {
            name: name,
            description: `${name} with ${teacher.name} on ${date} at ${req.params.time}`,
          },
          unit_amount: teacher.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // send session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// const createBooking = (req, res, next) => {

// }
