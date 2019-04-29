require("dotenv").config();
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

async function addUserToDb(user) {
  const saltRounds = 15;
  const { username, password } = user;
  const pool = new Pool({
    connectionString: process.env.DB_URI,
    ssl: true
  });
  let record = [];
  const client = await pool.connect();

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const query = {
      text: `INSERT INTO ${
        process.env.DB_USER_TABLE
      }(username, password, createdOn) VALUES($1, $2, NOW()) RETURNING id;`,
      values: [username, hash]
    };
    try {
      record = await client.query(query);
    } catch (e) {
      throw new Error(`Unable to create user: ${e}`);
    } finally {
      client.release();
    }
  } catch (e) {
    throw new Error(`Unable to create hash: ${e}`);
  }

  return record[0];
}

module.exports = addUserToDb;
