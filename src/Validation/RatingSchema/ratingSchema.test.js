const Joi = require("@hapi/joi");
const ratingSchema = require("./ratingSchema");

test("should return an empty error when an integer 1 through 5 is passed", () => {
  const rating = { rating: "4" };
  const result = Joi.validate(rating, ratingSchema);
  expect(result.error).toBeNull();
});

test("should return an error when a floating point is passed", () => {
  const rating = { rating: 4.5 };
  const result = Joi.validate(rating, ratingSchema);

  expect(result.error).not.toBeNull();
});

test("should return an error when a value is less than 1 is passed", () => {
  const rating = { rating: 0 };
  const result = Joi.validate(rating, ratingSchema);

  expect(result.error).not.toBeNull();
});

test("should return an error when a non-integer value is passed", () => {
  const rating = { rating: "not isbn" };
  const result = Joi.validate(rating, ratingSchema);

  expect(result.error).not.toBeNull();
});

// it('should [expected behaviour] when [scenario/context]', () => {
// });

test("short return an error when an integer greater than 5 is passed", () => {
  const rating = { rating: 22 };
  const result = Joi.validate(rating, ratingSchema);

  expect(result.error).not.toBeNull();
});
