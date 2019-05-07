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
    const match = await bcrypt.hash(password, saltRounds);
    try {
      const query = {
        text: `INSERT INTO ${
          process.env.DB_USER_TABLE
        }(username, password, createdOn) 
          VALUES($1, $2, NOW()) RETURNING id;`,
        values: [username, match]
      };
      record = await client.query(query);
      return record.rows[0];
    } catch (e) {
      throw new Error("Unable to create user");
    } finally {
      client.release();
    }
  } catch (e) {
    throw new Error(
      "User account may be already created. Try a different username"
    );
  }
}

module.exports = addUserToDb;
