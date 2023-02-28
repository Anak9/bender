const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);

router.use(authController.protect);

router.post(
  '/',
  authController.restrictTo('user'),
  reviewController.setUserAndTeacherId,
  reviewController.createReview
);

router
  .route('/:id')
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
