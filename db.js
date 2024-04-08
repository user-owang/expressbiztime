/** Database setup for BizTime. */

const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = null;
} else {
  DB_URI = process.env.DATABASE_URL;
}

let db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;
