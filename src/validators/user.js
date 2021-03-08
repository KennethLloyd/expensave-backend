const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);

const signUp = async (req, res, next) => {
  const bodySchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });

  try {
    const body = await bodySchema.validateAsync(req.body);
    req.body = body;
    return next();
  } catch (err) {
    return res.status(400).send({
      error: err.details[0].message,
    });
  }
};

const logIn = async (req, res, next) => {
  const bodySchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  try {
    const body = await bodySchema.validateAsync(req.body);
    req.body = body;
    return next();
  } catch (err) {
    return res.status(400).send({
      error: err.details[0].message,
    });
  }
};

const logInWithGoogle = async (req, res, next) => {
  const bodySchema = Joi.object({
    googleToken: Joi.string().required(),
  });

  try {
    const body = await bodySchema.validateAsync(req.body);
    req.body = body;
    return next();
  } catch (err) {
    return res.status(400).send({
      error: err.details[0].message,
    });
  }
};

const logInWithFacebook = async (req, res, next) => {
  const bodySchema = Joi.object({
    fbToken: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  try {
    const body = await bodySchema.validateAsync(req.body);
    req.body = body;
    return next();
  } catch (err) {
    return res.status(400).send({
      error: err.details[0].message,
    });
  }
};

const forgotPassword = async (req, res, next) => {
  const bodySchema = Joi.object({
    email: Joi.string().email().required(),
  });

  try {
    const body = await bodySchema.validateAsync(req.body);
    req.body = body;
    return next();
  } catch (err) {
    return res.status(400).send({
      error: err.details[0].message,
    });
  }
};

const resetPassword = async (req, res, next) => {
  const querySchema = Joi.object({
    token: Joi.string().required(),
  });

  const bodySchema = Joi.object({
    password: Joi.string().min(8).required(),
  });

  try {
    const query = await querySchema.validateAsync(req.query);
    const body = await bodySchema.validateAsync(req.body);

    req.query = query;
    req.body = body;

    return next();
  } catch (err) {
    return res.status(400).send({
      error: err.details[0].message,
    });
  }
};

module.exports = {
  signUp,
  logIn,
  logInWithGoogle,
  logInWithFacebook,
  forgotPassword,
  resetPassword,
};
