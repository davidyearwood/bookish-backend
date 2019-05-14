require("dotenv").config();
const url = require("url");
const axios = require("axios");

async function getBookReviews(isbns) {
  const goodReadsUrl = new url.URL(
    "https://www.goodreads.com/book/review_counts.json"
  );
  goodReadsUrl.searchParams.set("key", process.env.GOODREADS_KEY);
  goodReadsUrl.searchParams.set("isbns", isbns.join(","));

  const results = await axios.get(goodReadsUrl.toString());
  console.log();
  return results.data.books;
}

module.exports = getBookReviews;
