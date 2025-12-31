const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "gymnasie-arbete",
  port: 5432
});

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        phonenumber TEXT,
        birthday DATE,
        profile_picture TEXT,
        bio TEXT
      )
    `);
    console.log("Databasen är redo");
  } catch (err) {
    console.error("DB-fel:", err);
  }
})();

module.exports = pool;
