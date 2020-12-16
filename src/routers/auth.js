const express = require('express');
const authenticate = require('../middleware/authenticate');
const { authController } = require('../controllers');

const router = new express.Router();

router.post('/auth/signup', authController.signUp);
router.post('/auth/login', authController.logIn);
router.post('/auth/login/google', authController.logInWithGoogle);
router.post('/auth/login/fb', authController.logInWithFacebook);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/logout', authenticate, authController.logOut);

module.exports = router;