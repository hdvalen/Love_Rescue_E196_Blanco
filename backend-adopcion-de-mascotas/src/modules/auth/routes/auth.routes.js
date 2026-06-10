const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authLimiter, loginLimiter, ipBruteForceLimiter } = require('../../../middlewares/rateLimiter.middleware');
const { validate } = require('../../../middlewares/validate.middleware');
const authValidator = require('../../../validators/auth.validator');

router.post('/register', authLimiter, validate(authValidator.register), authController.register);

router.post('/login', ipBruteForceLimiter, loginLimiter, validate(authValidator.login), authController.login);

router.get('/verify-email', authController.verifyEmail);

router.post('/resend-verification', authLimiter, validate(authValidator.resendVerification), authController.resendVerification);

router.post('/refresh', validate(authValidator.refresh), authController.refresh);

router.post('/logout', validate(authValidator.logout), authController.logout);

router.post('/forgot-password', authLimiter, authController.forgotPassword);

router.post('/reset-password', authLimiter, authController.resetPassword);

router.put('/admin-verify/:id', authController.adminVerifyEmail);

module.exports = router;