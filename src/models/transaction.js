const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = mongoose.Schema(
  {
    transactionDate: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['Income', 'Expense'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true },
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
