require("dotenv").config();
const { Pool } = require("pg");

class Book {
  static async getBooks({ page, limit }) {
    if (!Number.isInteger(page) || !Number.isInteger(limit)) {
      throw new Error("Not a valid input");
    }

    const offset = page * limit - limit;

    const pool = new Pool({
      connectionString: process.env.DB_URI,
      ssl: true
    });

    const query = {
      text: `SELECT books.title, authors.name as author, books.year, books.isbn
    FROM authorsBooks
    INNER JOIN books ON authorsBooks.isbn = books.isbn
    INNER JOIN authors ON authorsBooks.authorId = authors.id
    LIMIT $1 OFFSET $2`,
      values: [limit, offset]
    };

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

  static async getBookWithReviews(isbn) {
    const pool = new Pool({
      connectionString: process.env.DB_URI,
      ssl: true
    });

    const query = {
      text: `SELECT books.isbn, books.title, books.year, authors.name, reviews.review, reviews.rating, reviews.createdOn, users.username
      FROM authorsBooks
      INNER JOIN books ON authorsBooks.isbn = books.isbn
      INNER JOIN authors ON authors.id = authorsBooks.authorId
      INNER JOIN reviews on reviews.bookisbn = authorsBooks.isbn
      INNER JOIN users on users.id = reviews.userId
      WHERE books.isbn = $1;`,
      values: [isbn]
    };

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

  static async getBook(isbn) {
    const pool = new Pool({
      connectionString: process.env.DB_URI,
      ssl: true
    });

    const query = {
      text: `SELECT books.isbn, books.title, books.year, authors.name
      FROM authorsBooks
      INNER JOIN books ON authorsBooks.isbn = books.isbn
      INNER JOIN authors ON authors.id = authorsBooks.authorId
      WHERE books.isbn = $1;`,
      values: [isbn]
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
}

module.exports = Book;
