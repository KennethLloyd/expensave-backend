const userRouter = require('./user');
const transactionRouter = require('./transaction');
const categoryRouter = require('./category');

module.exports = (app) => {
  app.use(userRouter);
  app.use(transactionRouter);
  app.use(categoryRouter);
};
