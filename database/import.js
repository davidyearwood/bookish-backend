require("dotenv").config();
const parse = require("csv-parser");
const fs = require("fs");
const path = require("path");

const books = [];
const csvFile = path.resolve(__dirname, "books.csv");
const insertBooks = require("./insertBooks");
const insertAuthors = require("./insertAuthors");
const insertAuthorsBooks = require("./insertAuthorsBooks");

fs.createReadStream(csvFile)
  .pipe(parse())
  .on("data", book => {
    books.push(book);
  })
  .on("end", async () => {
    try {
      await insertBooks(books);
      await insertAuthors(books);
      await insertAuthorsBooks(books);
    } catch (e) {
      console.log(e);
    }
  })
  .on("error", error => {
    console.log(error.stack);
  });
