const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review, {
  path: 'teacher',
  select: 'name photo modality price ratingsAverage ratingsQuantity',
});

////// filter?
exports.getAllReviews = factory.getAll(Review);

exports.setUserAndTeacherId = (req, res, next) => {
  if (!req.body.author) req.body.author = req.user._id;
  if (!req.body.teacher) req.body.teacher = req.params.teacherId;
  next();
};
