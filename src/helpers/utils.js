const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const getEmailTransporter = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

const err = (statusCode, message) => {
  const error = new Error(message);
  error.status = statusCode;

  return error;
};

const isValidID = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = {
  getEmailTransporter,
  err,
  isValidID,
};
