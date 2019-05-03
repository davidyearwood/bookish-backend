require("dotenv").config();
const uuid = require("uuid/v1");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/UserAccount");

class Auth {
  static async login(username, password) {
    if (!username || !password) {
      throw new Error("Bad Request: Please provide a password and username.");
    }
    try {
      const user = await User.findByUsername({ username });
      const match = await bcrypt.compare(password, user.password);
      const payload = {
        aud: "Auth User",
        usr: user.id
      };
      const options = {
        algorithm: "HS256",
        expiresIn: "15m",
        jwtid: uuid()
      };
      if (match) {
        try {
          const token = await jwt.sign(
            payload,
            process.env.SECRET_KEY,
            options
          );
          return token;
        } catch (err) {
          throw new Error("Unable to sign token");
        }
      } else {
        throw new Error("Password doesn't match");
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async logout(token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY, {
        algorithm: "HS256"
      });
      return decoded;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Auth;
