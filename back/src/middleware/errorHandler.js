const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Doğrulama hatası', 400, errors.array());
  }
  next();
};

const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  return error(res, err.message || 'Sunucu hatası', err.status || 500);
};

module.exports = { validate, globalErrorHandler };
