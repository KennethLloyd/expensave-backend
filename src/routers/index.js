const userRouter = require('./user');
const transactionRouter = require('./transaction');

module.exports = (app) => {
  app.use(userRouter);
  app.use(transactionRouter);
};
