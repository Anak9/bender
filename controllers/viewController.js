const Teacher = require('../models/teacherModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// icons available in all pug templates
exports.provideIcons = (req, res, next) => {
  const icons = {
    fire: ['mode_heat', 'electric_bolt'],
    water: ['water_drop', 'ecg_heart'],
    earth: ['eject', 'weight'],
    air: ['airwave', 'flight'],
  };

  res.locals.icons = icons;
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  const bendings = await Teacher.aggregate([
    {
      $group: {
        _id: '$bending',
        numTeachers: { $sum: 1 },
      },
    },
    {
      $project: {
        name: '$_id',
        numTeachers: 1,
      },
    },
  ]);

  res.status(200).render('overview', {
    title: 'Find your bending teacher today',
    bendings,
  });
});

exports.getBendingPage = catchAsync(async (req, res, next) => {
  const { bending } = req.params;

  req.query.bending = bending;

  const bendings = ['air', 'fire', 'water', 'earth'];

  if (!bendings.find((el) => el === bending)) {
    return next(
      new AppError(
        `Sorry, could not find ${req.originalUrl} in this server.`,
        404
      )
    );
  }
  const teachers = await Teacher.find(req.query);

  res.status(200).render('bending', {
    title: `${bending} bending teachers`,
    teachers,
    bending,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log in into your accont',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up with a free account',
  });
};

exports.getMyAccountPage = (req, res) => {
  res.status(200).render('account', {
    title: 'My account',
  });
};

exports.getTeacherPage = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const teacher = await Teacher.findOne({ slug: slug }).populate({
    path: 'reviews',
    select: 'rating review author',
  });

  res.status(200).render('teacher', {
    title: `${teacher.name}`,
    teacher,
  });
});
