require("dotenv").config();
const { Pool } = require("pg");
const addUserToDb = require("../utils/addUserToDb");

class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.saltRounds = 15;
    this.pool = null;
  }

  async save() {
    if (!this.password || !this.username) {
      throw new Error(
        "Username and password must be set before saving to the db"
      );
    }
    const newUser = await addUserToDb({
      password: this.password,
      username: this.username
    });

    console.log(newUser);
    return newUser.id;
  }

  static async findById(obj) {
    const pool = new Pool({
      connectionString: process.env.DB_URI,
      ssl: true
    });
    const query = {
      text: `SELECT * FROM ${process.env.DB_USER_TABLE} where id = $1`,
      values: [obj.id]
    };

    const client = await pool.connect();
    try {
      const response = await client.query(query);
      return response.rows[0] || null;
    } catch (e) {
      throw new Error(`Unable to create hash: ${e}`);
    } finally {
      client.release();
    }
  }

  static async findByUsername(obj) {
    const pool = new Pool({
      connectionString: process.env.DB_URI,
      ssl: true
    });

    const query = {
      text: `SELECT * FROM ${process.env.DB_USER_TABLE} where username = $1`,
      values: [obj.username]
    };

    const client = await pool.connect();
    try {
      const response = await client.query(query);
      return response.rows[0];
    } catch (e) {
      throw new Error(`Unable to create hash: ${e}`);
    } finally {
      client.release();
    }
  }
}

module.exports = User;
