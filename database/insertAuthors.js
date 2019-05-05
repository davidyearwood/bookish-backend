require("dotenv").config();
const { Pool } = require("pg");
const pgp = require("pg-promise")({
  capSQL: true // if you want all generated SQL capitalized
});

async function insertAuthors(records) {
  const pool = new Pool({
    connectionString: process.env.DB_URI,
    ssl: true
  });
  const client = await pool.connect();
  const query = `${pgp.helpers.insert(
    records,
    ["name"],
    process.env.DB_AUTHOR_TABLE
  )} ON CONFLICT (name) DO NOTHING`;
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

module.exports = insertAuthors;
