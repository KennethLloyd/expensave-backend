const authRouter = require('./auth');
const transactionRouter = require('./transaction');
const categoryRouter = require('./category');

module.exports = (app) => {
  app.use(authRouter);
  app.use(transactionRouter);
  app.use(categoryRouter);
};
