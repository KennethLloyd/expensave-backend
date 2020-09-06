const moment = require('moment');
const { Transaction } = require('../models');

/**
@api {post} /transactions Create Transaction
@apiVersion 1.0.0
@apiName CreateTransaction
@apiGroup Transaction

@apiParamExample {json} Request-Example:
{   
    "transactionDate": "2020-08-20 15:00",
    "transactionType": "Expense",
    "name": "Bills",
    "amount": "2500.00",
    "description": "Ubos na naman pera",
    "categories": ["5f405e9c4405d334ad5c80e3"]
}

@apiSuccess {Object} transaction Transaction details
@apiSuccessExample {json} Success-Response:
HTTP/1.1 201 Created
{
    "transaction": {
        "description": "Ubos na naman pera",
        "categories": [
            {
                "_id": "5f405e9c4405d334ad5c80e3",
                "name": "bills"
            }
        ],
        "_id": "5f4c4c9b6dd2c945d76ba3b2",
        "transactionDate": "2020-08-20 15:00",
        "transactionType": "Expense",
        "name": "Bills",
        "amount": 2500,
        "owner": "5f405e9c4405d334ad5c80de",
        "createdAt": "2020-08-31T01:04:27.595Z",
        "updatedAt": "2020-08-31T01:04:27.595Z",
        "__v": 0
    }
}
*/

const addTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.create({
      ...req.body,
      owner: req.user._id,
    });

    transaction = await transaction
      .populate('categories', 'name')
      .execPopulate();

    return res.status(201).send({ transaction });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

const getAllTransactions = async (req, res) => {
  const filter = {
    owner: req.user._id,
  };
  const projection = null;
  const options = {};

  if (req.query.from && req.query.to) {
    filter.transactionDate = {
      $gte: req.query.from,
      $lte: req.query.to,
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
      entryDate: 'desc',
    };
  }

  try {
    const transactions = await Transaction.find(filter, projection, options)
      .populate('categories', 'name')
      .exec();

    return res.send(transactions);
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

module.exports = {
  addTransaction,
  getAllTransactions,
};
