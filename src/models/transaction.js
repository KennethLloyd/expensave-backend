const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = mongoose.Schema(
  {
    transactionDate: {
      type: String,
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
    categories: [
      {
        type: ObjectId,
        ref: 'Category',
      },
    ],
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
