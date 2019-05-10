require("dotenv").config();
const { Pool } = require("pg");

class Review {
  constructor(obj) {
    this.userId = obj.userId;
    this.review = obj.review;
    this.rating = obj.rating;
    this.isbn = obj.isbn;
  }

  async createReview() {
    const pool = new Pool({
      connectionString: process.env.DB_URI,
      ssl: true
    });

    const query = {
      text: `INSERT into reviews(userId, bookIsbn, review, rating, createdOn)
      VALUES($1, $2, $3, $4, NOW())
      RETURNING id;`,
      values: [this.userId, this.isbn, this.review, this.rating]
    };

    const client = await pool.connect();
    try {
      const response = await client.query(query);
      return response.rows[0];
    } catch (err) {
      throw new Error(err);
    } finally {
      client.release();
    }
  }

  static async getReviews({ page, limit, isbn }) {
    if (!Number.isInteger(page) || !Number.isInteger(limit)) {
      throw new Error("Not a valid input");
    }

    let query;
    const offset = page * limit - limit;

    const pool = new Pool({
      connectionString: process.env.DB_URI,
      ssl: true
    });

    if (isbn) {
      query = {
        text: `SELECT reviews.bookisbn as isbn, reviews.rating, reviews.createdon, reviews.review, users.username
                FROM reviews
                INNER JOIN users ON reviews.userid = users.id
                WHERE reviews.bookisbn = $1
                LIMIT $2 OFFSET $3;`,
        values: [isbn, limit, offset]
      };
    } else {
      query = {
        text: `SELECT reviews.bookisbn as isbn, reviews.rating, reviews.createdon, reviews.review, users.username
                FROM reviews
                INNER JOIN users ON reviews.userid = users.id
                LIMIT $1 OFFSET $2;`,
        values: [limit, offset]
      };
    }

    const client = await pool.connect();
    try {
      const response = await client.query(query);
      return response.rows;
    } catch (err) {
      throw new Error(err);
    } finally {
      client.release();
    }
  }
}

module.exports = Review;
