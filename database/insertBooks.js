require("dotenv").config();
const { Pool } = require("pg");
const pgp = require("pg-promise")({
  capSQL: true // if you want all generated SQL capitalized
});

async function insertBooks(records) {
  const pool = new Pool({
    connectionString: process.env.DB_URI,
    ssl: true
  });
  const client = await pool.connect();
  const query = pgp.helpers.insert(
    records,
    ["isbn", "title", "year"],
    process.env.DB_BOOK_TABLE
  );
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

module.exports = insertBooks;
