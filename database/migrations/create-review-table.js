require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URI,
  ssl: true
});

const query = `CREATE TABLE ${process.env.DB_REVIEW_TABLE}(
  id serial PRIMARY KEY,
  userId integer REFERENCES userAccount(id),
  bookIsbn varchar REFERENCES book(isbn),
  review text NOT NULL,
  rating integer NOT NULL,
  createdOn TIMESTAMPTZ NOT NULL
);`;

pool.on("error", err => {
  console.log("Unexpected error on idle client", err);
  process.exit(-1);
});

// checkout pool
pool.connect().then(client =>
  client
    .query(query)
    .then(res => {
      client.release();
      console.log(res);
    })
    .catch(error => {
      client.release();
      console.log(error.stack);
    })
);
