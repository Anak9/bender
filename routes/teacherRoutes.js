const express = require('express');
const teacherController = require('../controllers/teacherController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Special routes
router.get('/status', teacherController.getTeachersStatus);
router.get('/distances/:latlng/unit/:unit', teacherController.getDistances);
router.get(
  '/teachers-within/:distance/center/:latlng/unit/:unit',
  teacherController.getTeachersWithin
);

router
  .route('/')
  .get(teacherController.getAllTeachers)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    teacherController.createTeacher
  );

router
  .route('/:id')
  .get(teacherController.getTeacher)
  .patch(
    authController.protect,
    authController.restrictTo('admin teacher'),
    teacherController.updateTeacher
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    teacherController.deleteTeacher
  );

// NESTED ROUTES for REVIEWS
router.use('/:teacherId/reviews', reviewRouter);

module.exports = router;
