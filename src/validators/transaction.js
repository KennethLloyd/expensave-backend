const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const moment = require('moment');

const Joi = JoiBase.extend(JoiDate);

const addTransaction = async (req, res, next) => {
  const bodySchema = Joi.object({
    transactionDate: Joi.date().format('YYYY-MM-DD HH:mm').required(),
    transactionType: Joi.string().valid('Income', 'Expense').required(),
    name: Joi.string().required(),
    amount: Joi.number().required(),
    details: Joi.string().empty(''),
  });

  try {
    const body = await bodySchema.validateAsync(req.body);
    req.body = body;
    req.body.transactionDate = moment(req.body.transactionDate).format(
      'YYYY-MM-DD HH:mm',
    );
    return next();
  } catch (err) {
    return res.status(400).send({
      error: err.details[0].message,
    });
  }
};

const getAllTransactions = async (req, res, next) => {
  const querySchema = Joi.object({
    sortBy: Joi.string().empty(''),
    sortOrder: Joi.string().uppercase().valid('ASC', 'DESC').empty(''),
    from: Joi.date().format('YYYY-MM-DD').empty(''),
    to: Joi.date().format('YYYY-MM-DD').empty(''),
  });

  try {
    const query = await querySchema.validateAsync(req.query);
    req.query = query;

    return next();
  } catch (err) {
    return res.status(400).send({
      error: err.details[0].message,
    });
  }
};

module.exports = {
  addTransaction,
  getAllTransactions,
};
