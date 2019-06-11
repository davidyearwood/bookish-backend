const User = require("../Models/UserAccount");

function registerUser(req, res) {
  if (
    typeof req.body.password === "undefined" ||
    typeof req.body.username === "undefined"
  ) {
    throw new Error("Password or username wasn't specified.");
  }

  const user = new User(req.body.username, req.body.password);

  user
    .save()
    .then(userId => {
      console.log(userId);
      res.json({
        message: "created",
        user: userId
      });
    })
    .catch(err => {
      console.log(err.stack);

      res.status(500).send({ error: err.message });
    });
}

module.exports = registerUser;
