require("dotenv").config();
const express = require("express");
const User = require("./Models/UserAccount");
const bodyParser = require("body-parser");

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({
    message: "welcome"
  });
});

app.post("/users", (req, res) => {
  let user = new User(req.body.username, req.body.password);
  try {
    user.save();
  } catch (e) {
    res.json({
      error: e
    });
  }

  res.json({
    message: "created",
    statusCode: 201
  });
});

app.listen(process.env.APP_PORT, () => {
  console.log(`listening on port ${process.env.APP_PORT}`);
});
