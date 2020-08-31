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
            "5f405e9c4405d334ad5c80e3"
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
    const transaction = new Transaction({
      ...req.body,
      owner: req.user._id,
    });

    await transaction.save();

    return res.status(201).send({ transaction });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

module.exports = {
  addTransaction,
};
