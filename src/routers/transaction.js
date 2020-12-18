const express = require('express');
const authenticate = require('../middleware/authenticate');
const { transactionController } = require('../controllers');
const { transactionValidator } = require('../validators');

const router = new express.Router();

router.post(
  '/transactions',
  authenticate,
  transactionValidator.addTransaction,
  transactionController.addTransaction,
);

router.get(
  '/transactions',
  authenticate,
  transactionValidator.getAllTransactions,
  transactionController.getAllTransactions,
);

module.exports = router;
