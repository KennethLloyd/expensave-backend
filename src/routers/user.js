const express = require('express');
const { userController } = require('../controllers');
const { userValidator } = require('../validators');

const router = new express.Router();

router.post('/auth/signup', userValidator.signUp, userController.signUp);
router.post('/auth/login', userValidator.logIn, userController.logIn);
router.post(
  '/auth/login/google',
  userValidator.logInWithGoogle,
  userController.logInWithGoogle,
);
router.post(
  '/auth/login/fb',
  userValidator.logInWithFacebook,
  userController.logInWithFacebook,
);
router.post(
  '/auth/forgot-password',
  userValidator.forgotPassword,
  userController.forgotPassword,
);
router.post(
  '/auth/reset-password',
  userValidator.resetPassword,
  userController.resetPassword,
);

module.exports = router;
