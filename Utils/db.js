const mongodb = require("mongodb");

//https://maku77.github.io/nodejs/env/dotenv.html
//https://qiita.com/ozaki25/items/3e2cf94f29bd0edc1979
require("dotenv").config();
if (typeof process.env.CUSTOMCONNSTR_mongodburl == "undefined") {
  console.error('Error: "CUSTOMCONNSTR_mongodburl" is not set.');
  console.error(
    "Please consider adding a .env file with CUSTOMCONNSTR_mongodburl."
  );
  process.exit(1);
}
const connectionString = process.env.CUSTOMCONNSTR_mongodburl;

mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, client) {
    if (err) console.error("error happened on connecting to cosmos db", err);
    module.exports = client;
    const app = require("../app");
    app.listen(process.env.PORT);
  }
);
