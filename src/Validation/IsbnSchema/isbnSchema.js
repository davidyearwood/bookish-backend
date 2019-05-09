const Joi = require("@hapi/joi");

module.exports = {
  isbn: Joi.string()
    .regex(/^[0-9]+$/)
    .min(10)
    .max(10)
    .required()
};
