const moment = require('moment');
const { Transaction } = require('../models');
const { err, isValidID } = require('../helpers/utils');

/**
@api {post} /transactions CREATE Transaction
@apiVersion 1.0.0
@apiName CreateTransaction
@apiGroup Transaction

@apiParamExample {json} Request-Example:
{   
    "transactionDate": "2020-12-20 15:00",
    "transactionType": "Expense",
    "name": "Shoes",
    "amount": "999.00",
    "details": "Bought two new shoes for the price of one"
}

@apiSuccess {Object} transaction Transaction details
@apiSuccessExample {json} Success-Response:
HTTP/1.1 201 Created
{
    "transaction": {
        "details": "Bought two new shoes for the price of one",
        "_id": "5fe2f5d8863af741e4eef3e4",
        "transactionDate": "Sun Dec 20 2020 15:00:00 GMT+0800 (Taipei Standard Time)",
        "transactionType": "Expense",
        "name": "Shoes",
        "amount": 999,
        "owner": "5fde8b69c229ae19c172b155",
        "createdAt": "2020-12-23T07:46:32.670Z",
        "updatedAt": "2020-12-23T07:46:32.670Z",
        "__v": 0
    }
}
*/

const addTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      owner: req.user._id,
    });

    return res.status(201).send({ transaction });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {get} /transactions GET ALL Transactions
@apiVersion 1.0.0
@apiName GetAllTransactions
@apiGroup Transaction

@apiParam [from] From Date
@apiParam [to] To Date
@apiParam [sortBy] Sort By
@apiParam [sortOrder] Sort Order
@apiParam [transactionType] Income or Expense filter

@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
[
    {
        "details": "Bought two new shoes for the price of one",
        "_id": "5fe2f5d8863af741e4eef3e4",
        "transactionDate": "Sun Dec 20 2020 15:00:00 GMT+0800 (Taipei Standard Time)",
        "transactionType": "Expense",
        "name": "Shoes",
        "amount": 999,
        "owner": "5fde8b69c229ae19c172b155",
        "createdAt": "2020-12-23T07:46:32.670Z",
        "updatedAt": "2020-12-23T07:46:32.670Z",
        "__v": 0
    }
]
*/

const getAllTransactions = async (req, res) => {
  const filter = {
    owner: req.user._id,
  };

  const projection = null;
  const options = {};

  if (req.query.from && req.query.to) {
    filter.transactionDate = {
      $gte: moment(req.query.from).format('YYYY-MM-DD'),
      $lte: moment(req.query.to).format('YYYY-MM-DD'),
    };
  } else {
    const thisMonth = moment().format('YYYY-MM');
    const nextMonth = moment().add(1, 'month').format('YYYY-MM');

    filter.transactionDate = {
      $gte: `${thisMonth}-01`,
      $lte: `${nextMonth}-01`,
    };
  }

  if (req.query.sortBy) {
    let sortOrder = 'asc';

    if (
      req.query.sortOrder &&
      ['asc', 'desc'].includes(req.query.sortOrder.toLowerCase())
    ) {
      sortOrder = req.query.sortOrder.toLowerCase();
    }

    options.sort = {
      [req.query.sortBy]: sortOrder,
    };
  } else {
    options.sort = {
      transactionDate: 'desc',
    };
  }

  if (req.query.transactionType) {
    filter.transactionType = req.query.transactionType;
  }

  try {
    const transactions = await Transaction.find(filter, projection, options);

    const totalIncome = transactions.reduce((total, transaction) => {
      if (transaction.transactionType === 'Income') {
        total += transaction.amount;
      }

      return total;
    }, 0);

    const totalExpenses = transactions.reduce((total, transaction) => {
      if (transaction.transactionType === 'Expense') {
        total += transaction.amount;
      }

      return total;
    }, 0);

    return res.send({
      transactions,
      totalIncome,
      totalExpenses,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
@api {delete} /transactions/:_id DELETE Transaction
@apiVersion 1.0.0
@apiName DeleteTransaction
@apiGroup Transaction

@apiSuccessExample {json} Success-Response:
HTTP/1.1 200 OK
{
    "message": "Successfully deleted transaction",
    "transaction": {
        "details": "Bought two new shoes for the price of one",
        "_id": "5fe2f5d8863af741e4eef3e4",
        "transactionDate": "Sun Dec 20 2020 15:00:00 GMT+0800 (Taipei Standard Time)",
        "transactionType": "Expense",
        "name": "Shoes",
        "amount": 999,
        "owner": "5fde8b69c229ae19c172b155",
        "createdAt": "2020-12-23T07:46:32.670Z",
        "updatedAt": "2020-12-23T07:46:32.670Z",
        "__v": 0
    }
}
*/

const deleteTransaction = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!isValidID(_id)) throw err(400, 'Invalid ID');

    const transaction = await Transaction.findById(_id);

    if (!transaction) throw err(404, 'Transaction not found');

    await Transaction.deleteOne({ _id });

    return res.send({
      message: 'Successfully deleted transaction',
      transaction,
    });
  } catch (e) {
    console.log(e);

    if (e.status) {
      return res.status(e.status).send({ error: e.message });
    }
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

module.exports = {
  addTransaction,
  getAllTransactions,
  deleteTransaction,
};
