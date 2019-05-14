const Joi = require("@hapi/joi");

module.exports = {
  isbn: Joi.string()
    .regex(/^\d{9}[\d|X]$/)
    .min(10)
    .max(10)
    .required()
};
