require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URI,
  ssl: true
});

pool.on("error", err => {
  console.log("Unexpected error on idle client", err);
  process.exit(-1);
});

async function up() {
  const query = `CREATE TABLE ${process.env.DB_BOOK_TABLE}(
    isbn varchar PRIMARY KEY,
    title varchar not null, 
    year integer not null
  );`;
  const client = await pool.connect();
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

async function down() {
  const query = `DROP TABLE ${process.env.DB_BOOK_TABLE}, CASCADE`;
  const client = await pool.connect();
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

module.exports = {
  up,
  down
};
