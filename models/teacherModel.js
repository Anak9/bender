const mongoose = require('mongoose');
const slugify = require('slugify');

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A teacher must have a name'],
    },

    slug: {
      type: String,
      index: true,
    },

    bending: {
      type: String,
      required: true,
      enum: {
        values: ['air', 'water', 'earth', 'fire'],
        message: 'Bending must be either: air, water, earth or fire',
      },
      index: true,
    },

    presentation: {
      type: String,
      required: true,
      maxLength: [200, 'Presentation should not have more than 200 characters'],
      minLength: [100, 'Presentation should have at least 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'A tour must have a description'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    ratingsAverage: {
      type: Number,
      default: 4,
      max: [5, 'Average can not be above 5'],
      min: [0, 'Average can not be below 0'],
      set: (value) => Math.round(value * 10) / 10, // round to number with one decimal digit
    },

    photo: String,

    modality: {
      type: String,
      enum: ['online', 'onsite', 'online and onsite'],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    // GeoJSON (location on earth)
    classLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // longitude (-180°) - (180°), latitude (-90°) - (90°)
      address: String,
    },

    special: {
      type: Boolean,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    aides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // "reviews": {}, // virtual

    groupClasses: Boolean,

    groupSize: Number,
  },

  // when data is exported as json and as obj virtual fields should be showed
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// DOCUMENT MIDDLEWARES
teacherSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARES

// POPULATE - (teacher and aide: one-to-FEW)
teacherSchema.pre(/^find/, function (next) {
  this.find().populate({ path: 'aides', select: 'name photo' });
  next();
});

// VIRTUAL POPULATE - (teacher and reviews: one-to-MANY)
teacherSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'teacher',
});

// INDEXES
teacherSchema.index({ price: 1, ratingsAverage: -1 });

teacherSchema.index({ classLocation: '2dsphere' });

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
