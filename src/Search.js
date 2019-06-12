require("dotenv").config();
const { Pool } = require("pg");

async function search({ q, page, limit }) {
  if (!Number.isInteger(page) || !Number.isInteger(limit)) {
    throw new Error("page and limit value must be an integer value.");
  }

  const offset = page * limit - limit;

  const pool = new Pool({
    connectionString: process.env.DB_URI,
    ssl: true
  });

  // ISBN number of a book, the title of a book, or the author of a book
  const query = {
    text: `SELECT 
    ${process.env.DB_BOOK_TABLE}.isbn, 
    ${process.env.DB_BOOK_TABLE}.title, 
    ${process.env.DB_AUTHOR_TABLE}.name as author, 
    ${process.env.DB_BOOK_TABLE}.year,
    ${process.env.DB_BOOK_TABLE}.avgrating
    FROM ${process.env.DB_AUTHORS_BOOK_TABLE}
    INNER JOIN ${process.env.DB_BOOK_TABLE} ON 
    ${process.env.DB_AUTHORS_BOOK_TABLE}.isbn = ${
      process.env.DB_BOOK_TABLE
    }.isbn
    INNER JOIN ${process.env.DB_AUTHOR_TABLE} ON 
    ${process.env.DB_AUTHORS_BOOK_TABLE}.authorId = ${
      process.env.DB_AUTHOR_TABLE
    }.id
    WHERE to_tsvector('english', coalesce(${process.env.DB_BOOK_TABLE}.title) 
    || ' ' || coalesce(${process.env.DB_BOOK_TABLE}.isbn) 
    || ' ' || coalesce(${process.env.DB_AUTHOR_TABLE}.name)) 
    @@ plainto_tsquery('english', $1)
    LIMIT $2 OFFSET $3;`,
    values: [q, limit, offset]
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

module.exports = search;
