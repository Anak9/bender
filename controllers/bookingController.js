const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Teacher = require('../models/teacherModel');
const User = require('../models/userModel');

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
    success_url: `${req.protocol}://${req.get('host')}/my-classes`,
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
            images: [
              `${req.protocol}://${req.get('host')}/img/teachers/${
                teacher.photo
              }`,
            ],
          },
          unit_amount: teacher.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      date,
      time: req.params.time,
      modality: req.params.modality,
      groupClass: req.params.groupClass,
    },
  });

  // send session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBooking = catchAsync(async (session) => {
  const { id } = await User.findOne({ email: session.customer_email });

  const bookingObj = {
    teacher: session.client_reference_id,
    user: id,
    price: session.amount_total / 100,
    date: session.metadata.date,
    time: session.metadata.time,
    modality: session.metadata.modality,
    groupClass: session.metadata.groupClass,
  };

  // UNHANDLED REJECTION! Shutting down...
  // Mar 8 09:23:16 PM  ValidationError Booking validation failed: groupClass: Cast to Boolean failed for value "[object NodeList]" (type string) at path "groupClass" because of "CastError", modality: `[object NodeList]` is not a valid enum value for path `modality`.
  // Mar 8 09:23:19 PM  [

  await Booking.create(bookingObj);
});

// STRIPE*
exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`); // stripe will receive this error
  }

  if (event.type === 'checkout.session.completed')
    createBooking(event.data.object);

  res.status(200).json({ received: true });
};

/**
 * STRIPE*
 *
 * on stripe web page we can create a webhook. For that we need to give an address (url) (so only do this after deploying
 * the app cause needs a real domain)
 * after a successfull checkout session is completed, stripe will send a POST request to the given url with the info
 * about the checkout session
 */
