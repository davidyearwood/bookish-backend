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

    const query = `SELECT books.title, authors.name as author, books.year, books.isbn
    FROM authorsBooks
    INNER JOIN books ON authorsBooks.isbn = books.isbn
    INNER JOIN authors ON authorsBooks.authorId = authors.id
    LIMIT ${limit} OFFSET ${offset}`;

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
