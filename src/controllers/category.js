const { Category } = require('../models');

const addCategory = async (req, res) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
      type: req.body.transactionType,
      owner: req.user._id,
    });

    await newCategory.save();

    res.status(201).send({ category: newCategory });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ owner: req.user._id });

    res.send(categories);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

const insertInitialCategories = async (userId) => {
  const initialCategories = [
    { name: 'salary', transactionType: 'Income', owner: userId },
    { name: 'business', transactionType: 'Income', owner: userId },
    { name: 'gift', transactionType: 'Income', owner: userId },
    { name: 'bills', transactionType: 'Expense', owner: userId },
    { name: 'dinner', transactionType: 'Expense', owner: userId },
    { name: 'leisure', transactionType: 'Expense', owner: userId },
  ];

  try {
    const categories = await Category.create(initialCategories);
    return categories;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  addCategory,
  getCategories,
  insertInitialCategories,
};
