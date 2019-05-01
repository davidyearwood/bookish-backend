const User = require("../Models/UserAccount");

function registerUser(req, res) {
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
