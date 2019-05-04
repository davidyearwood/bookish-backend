/* eslint-disable */

require("dotenv").config();

const createAuthorTable = require("./create-author-table");
const createAuthorsBookTable = require("./create-authors-book-table");
const createBookTable = require("./create-book-table");
const createReviewTable = require("./create-review-table");
const createUserTable = require("./create-user-table");

const list = [
  createUserTable,
  createAuthorTable,
  createBookTable,
  createReviewTable,
  createAuthorsBookTable
];

async function createTablesInorder(list) {
  for (let i = 0; i < list.length; i++) {
    try {
      const table = await list[i].up();
    } catch (err) {
      console.log(err.stack);
    }
  }
}

createTablesInorder(list).catch(err => console.log(err));
