const jwt = require('jsonwebtoken');
const moment = require('moment');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.expiration < moment().format('YYYY-MM-DD HH:mm')) {
      return res.status(401).send({ error: 'Token already expired' });
    }

    req.token = token;
    req.user = {
      _id: decoded._id,
    };

    return next();
  } catch (e) {
    return res.status(401).send({ error: 'Please authenticate' });
  }
};

module.exports = authenticate;
