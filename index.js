require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const esapi = require("node-esapi");
const helmet = require("helmet");
const User = require("./src/Models/UserAccount");
const registerUser = require("./src/utils/registerUser");
const Auth = require("./src/utils/Auth");
const Book = require("./src/Models/Book");
const Review = require("./src/Models/Review");
const isbnSchema = require("./src/Validation/IsbnSchema/isbnSchema");
const ratingSchema = require("./src/Validation/RatingSchema/ratingSchema");
const search = require("./src/Search");

const BLACKLIST = {};
const app = express();

function isBlacklisted(token) {
  return Object.prototype.hasOwnProperty.call(BLACKLIST, token);
}

app.use(helmet());
app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/search", (req, res) => {
  const token = req.cookies.session_id;

  const limit = 10;
  const { q } = req.query;
  let page = parseInt(req.query.page, 10);

  if (!Number.isInteger(page)) {
    page = 1;
  }

  if (!q) {
    res.status(404).send({
      message: "Empty query value"
    });

    return false;
  }

  jwt.verify(token, process.env.SECRET_KEY, { algorithms: "HS256" }, err => {
    if (err) {
      res.status(401).send({
        message: "Wrong or no authentication ID/password provided"
      });
      return false;
    }

    search({ q, page, limit })
      .then(results => {
        if (results.length === 0) {
          res.status(404).send({
            message: "No results found"
          });
        } else {
          res.status(200).send({
            results
          });
        }
      })
      .catch(e => {
        console.log(e);
        res.status(404).send({
          message: "Unable to find requested book(s)"
        });
      });

    return true;
  });

  return true;
});

app.get("/reviews", (req, res) => {
  const { isbn } = req.query;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;

  if (isbn) {
    const { error } = Joi.validate({ isbn }, isbnSchema);

    if (error) {
      res.status(500).send({
        message: "Internal server error"
      });

      return false;
    }
  }

  if (Number.isNaN(page)) {
    res.status(500).send({
      message: "Internal server error"
    });

    return false;
  }

  Review.getReviews({ page, limit: 4, isbn })
    .then(reviews => {
      res.json(reviews);
    })
    .catch(() => {
      res.status(404).send({ message: "Reviews not found" });
    });

  return true;
});

app.post("/reviews", (req, res) => {
  const token = req.cookies.session_id;
  const { isbn, review, rating } = req.body;

  const schema = Object.assign({}, ratingSchema, isbnSchema, {
    review: Joi.string().required()
  });

  const { error, value } = Joi.validate(
    { isbn, review: esapi.encoder().encodeForHTML(review), rating },
    schema,
    { escapeHtml: true }
  );

  if (error) {
    res.status(500).send({
      message: "Internal server error"
    });

    return false;
  }

  jwt.verify(
    token,
    process.env.SECRET_KEY,
    { algorithms: "HS256 " },
    (err, decoded) => {
      if (err) {
        res.status(401).send({
          message: "Wrong or no authentication ID/password provided"
        });
        return false;
      }

      if (isBlacklisted(decoded.jti)) {
        res.status(401).send({
          message: "Unathorize to post a review"
        });

        return false;
      }

      const newReview = new Review({
        isbn: value.isbn,
        review: value.review,
        rating: value.rating,
        userId: decoded.usr
      });

      newReview
        .createReview()
        .then(createdReview => {
          res.status(201).send({
            review: createdReview
          });
        })
        .catch(() => {
          res.status(500).send({
            message: "Internal server error"
          });
        });
      return true;
    }
  );

  return true;
});

app.get("/books/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (isbn) {
    const { error } = Joi.validate({ isbn }, isbnSchema);

    if (error) {
      res.status(500).send({
        message: "Internal server error"
      });

      return false;
    }
  }

  Book.getBook(isbn)
    .then(book => {
      res.json(book);
    })
    .catch(() => {
      res.status(404).send({ message: "Book not found" });
    });

  return true;
});

app.get("/books", (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const token = req.cookies.session_id;

  if (Number.isNaN(page)) {
    res.status(400).send({
      message: "This request is malformed."
    });

    return false;
  }

  jwt.verify(
    token,
    process.env.SECRET_KEY,
    { algorithms: "HS256 " },
    (err, decoded) => {
      if (err) {
        res.status(401).send({
          message: "Wrong or no authentication ID/password provided"
        });
        return false;
      }

      if (isBlacklisted(decoded.jti)) {
        res.status(401).send({
          message: "Wrong or no authentication ID/password provided"
        });
        return false;
      }

      Book.getBooks({ page, limit: 10 }).then(value => {
        res.status(200).send(value);
      });

      return true;
    }
  );

  return true;
});

app.get("/users", (req, res) => {
  jwt.verify(
    req.cookies.session_id,
    process.env.SECRET_KEY,
    { algorithms: "HS256" },
    (err, decoded) => {
      if (err) {
        return false;
      }
      if (isBlacklisted(decoded.jti)) {
        res.json({
          message: "Unauthorize to access this page."
        });
        return false;
      }
      User.findById({ id: decoded.usr }).then(user => {
        res.json({
          username: user.username,
          id: user.id,
          createdon: user.createdon
        });
      });

      return true;
    }
  );

  return true;
});

app.post("/register", registerUser);

app.post("/logout", (req, res) => {
  Auth.logout(req.cookies.session_id)
    .then(decoded => {
      BLACKLIST[decoded.jti] = decoded.usr;
      res.clearCookie("session_id");
      res.status(200).send({ message: "Logout succesfully." });
    })
    .catch(() => {
      res.status(500).send({ message: "Internal Server Error." });
    });
});

app.post("/login", (req, res) => {
  Auth.login(req.body.username, req.body.password)
    .then(token => {
      res.cookie("session_id", token, {
        secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 15
      });
      res.json({ message: "Welcome to Bookish!" });
    })
    .catch(() => {
      res.status(500).send({
        message: "Unable to login"
      });
    });
});

app.listen(process.env.APP_PORT, () => {
  console.log(`listening on port ${process.env.APP_PORT}`);
});

// JWT Implementation
