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
  const query = `CREATE TABLE ${process.env.DB_USER_TABLE}(
    id serial PRIMARY KEY,
    username VARCHAR (50) UNIQUE NOT NULL,
    password VARCHAR (255) NOT NULL,
    createdOn TIMESTAMPTZ NOT NULL,
    passwordSalt VARCHAR (100) UNIQUE NOT NULL
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
  const query = `DROP TABLE ${process.env.DB_USER_TABLE}, CASCADE`;
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
