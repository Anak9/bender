const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const Teacher = require('./teacherModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    rating: {
      type: Number,
      required: true,
      max: [5, 'Ratings can not be higher than 5'],
      min: [0, 'Ratings can not be lower than 0'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// METHODS
reviewSchema.statics.calcAverageRating = async function (teacherId) {
  const aggregation = await this.aggregate([
    {
      $match: { teacher: teacherId },
    },
    {
      $group: {
        _id: '$teacher',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (aggregation.length > 0) {
    await Teacher.findByIdAndUpdate(teacherId, {
      ratingsAverage: aggregation[0].avgRating,
      ratingsQuantity: aggregation[0].numRatings,
    });
  } else {
    // in case only one review exists and it is deleted
    await Teacher.findByIdAndUpdate(teacherId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// DOCUMENT MIDDLEWARES
reviewSchema.pre('save', async function (next) {
  // check if teacher exists
  if (!(await Teacher.findById(this.teacher)))
    next(new AppError('No teacher found with that id', 400));
});

// QUERY MIDDLEWARES
reviewSchema.pre('findOne', function (next) {
  this.find().populate({ path: 'teacher', select: 'name' });
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.find().populate({ path: 'author', select: 'name photo' });
  next();
});

reviewSchema.post(/^findOneAnd/, async (doc) => {
  await doc.constructor.calcAverageRating(doc.teacher);
});

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.teacher);
});

// INDEXES

// a user can not post more than one review about a teacher
// reviewSchema.index({ author: 1, teacher: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
