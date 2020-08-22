const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      required: true,
      enum: ['Income', 'Expense'],
    },
    owner: {
      type: ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true },
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
