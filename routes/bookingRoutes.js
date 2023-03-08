const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// GET checkout session from STRIPE
router.get(
  '/checkout-session/:teacherId/date/:date/time/:time/modality/:modality/groupClass/:groupClass',
  bookingController.getCheckoutSession
);

router
  .route('/')
  .get(authController.restrictBookings, bookingController.getAllBookings)
  .post(authController.restrictTo('admin'), bookingController.createBooking);

router
  .route('/:id')
  .get(authController.restrictBookings, bookingController.getBooking)
  .patch(authController.restrictBookings, bookingController.updateBooking)
  .delete(authController.restrictBookings, bookingController.deleteBooking);

module.exports = router;
