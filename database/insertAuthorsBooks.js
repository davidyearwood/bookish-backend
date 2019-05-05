require("dotenv").config();
const { Pool } = require("pg");
const pgp = require("pg-promise")({
  capSQL: true // if you want all generated SQL capitalized
});

function authorsBooksInsertQuery(records) {
  const values = records
    .map(record => {
      return `('${record.isbn}', (SELECT DISTINCT ${
        process.env.DB_AUTHOR_TABLE
      }.id
      FROM ${process.env.DB_AUTHOR_TABLE}
      WHERE ${process.env.DB_AUTHOR_TABLE}.name=${pgp.as.text(record.name)}))`;
    })
    .join(", ");
  return `INSERT INTO ${
    process.env.DB_AUTHORS_BOOK_TABLE
  }(isbn, authorId) VALUES ${values};`;
}

async function insertAuthorsBooks(records) {
  const pool = new Pool({
    connectionString: process.env.DB_URI,
    ssl: true
  });
  const client = await pool.connect();
  const query = authorsBooksInsertQuery(records);
  try {
    const res = await client.query(query);
    return res;
  } catch (err) {
    console.log(err.stack);
    throw new Error(err);
  } finally {
    client.release();
  }
}

module.exports = insertAuthorsBooks;
