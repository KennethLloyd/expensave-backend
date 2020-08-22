const { Transaction } = require('../models');

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
