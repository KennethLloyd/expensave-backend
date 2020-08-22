const express = require('express');
const authenticate = require('../middleware/authenticate');
const { transactionController } = require('../controllers');

const router = new express.Router();

router.post(
  '/transactions',
  authenticate,
  transactionController.addTransaction,
);

module.exports = router;
