const Joi = require("@hapi/joi");
const isbnSchema = require("./isbnSchema");

test("it should return an error when a non isbn number is used", () => {
  const isbnNumber = { isbn: "not isbn" };
  const result = Joi.validate(isbnNumber, isbnSchema);

  expect(result.error).not.toBeNull();
});

test("it shouldn't return an error when a isbn number is used", () => {
  const isbnNumber = { isbn: "1416949658" };
  const result = Joi.validate(isbnNumber, isbnSchema);

  expect(result.error).toBeNull();
});

test("it should return an error when a non isbn number is used", () => {
  const isbnNumber = { isbn: undefined };
  const result = Joi.validate(isbnNumber, isbnSchema);

  expect(result.error).not.toBeNull();
});
