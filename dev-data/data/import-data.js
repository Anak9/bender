const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Teacher = require('../../models/teacherModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

// CONNECT TO DATABASE
const database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', false);

mongoose
  .connect(database)
  .then(() => console.log('database connection successful!'));

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const teachers = JSON.parse(
  fs.readFileSync(`${__dirname}/teachers.json`, 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const calcAverageRating = async (teacherId) => {
  const ratings = await Review.aggregate([
    {
      $match: { teacher: teacherId },
    },
    {
      $group: {
        _id: '$teacher',
        numRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);

  await Teacher.findByIdAndUpdate(teacherId, {
    ratingsQuantity: ratings[0].numRatings,
    ratingsAverage: ratings[0].avgRatings,
  });
};

// IMPORT DATA
const importData = async () => {
  try {
    await Teacher.create(teachers);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    [...teachers].forEach(async (doc) => {
      await calcAverageRating(doc._id);
    });
  } catch (err) {
    console.log(`Error! ${err}`);
  }
  process.exit();
};

// DELETE DATA
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Teacher.deleteMany();
    await Review.deleteMany();
  } catch (err) {
    console.log(`Error! ${err}`);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
