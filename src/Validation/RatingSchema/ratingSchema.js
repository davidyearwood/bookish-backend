const Joi = require("@hapi/joi");

module.exports = {
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
};
