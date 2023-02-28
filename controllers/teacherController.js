const Teacher = require('../models/teacherModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllTeachers = factory.getAll(Teacher);
exports.createTeacher = factory.createOne(Teacher);
exports.updateTeacher = factory.updateOne(Teacher);
exports.deleteTeacher = factory.deleteOne(Teacher);
exports.getTeacher = factory.getOne(Teacher, {
  path: 'reviews',
  select: '-__v',
});

// AGGREGATION PIPELINES
exports.getTeachersStatus = catchAsync(async (req, res, next) => {
  const aggregation = await Teacher.aggregate([
    {
      $group: {
        _id: '$bending',
        numTeachers: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      result: aggregation,
    },
  });
});

// GEOSPACIAL aggregation
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const lat = latlng.split(',')[0];
  const lng = latlng.split(',')[1];

  const multiplier = unit === 'km' ? 0.001 : 0.000621371; // kilometers or miles

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide a latitude and longitude in the lat,lng format.',
        400
      )
    );
  }

  const distances = await Teacher.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
        spherical: true,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});

exports.getTeachersWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6371.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide a latitude and longitude in the lat,lng format.',
        400
      )
    );
  }

  const teachers = await Teacher.find({
    classLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    result: teachers.length,
    data: {
      teachers,
    },
  });
});
