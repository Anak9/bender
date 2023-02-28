const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewController.provideIcons);
router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
router.get('/bending/:bending', viewController.getBendingPage);
router.get('/teacher/:slug', viewController.getTeacherPage);
router.get('/login', viewController.getLoginForm);
router.get('/signup', viewController.getSignupForm);
router.get('/me', authController.protect, viewController.getMyAccountPage);

module.exports = router;
