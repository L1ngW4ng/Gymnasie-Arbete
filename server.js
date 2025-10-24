require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require("path");

// PostgreSQL-anslutning via miljövariabel
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// Root route
app.get("/", (req, res) => {
    res.send("Servern fungerar!");
});

// REGISTER
app.post("/register", async (req, res) => {
    const { username, password, email, phonenumber, birthday } = req.body;
    if (!username || !password) return res.status(400).send("Saknas username eller password");

    try {
        const hash = await bcrypt.hash(password, 10);
        const profilePath = null; // Lagra profilbild senare

        await db.query(
            `INSERT INTO users (username, password, email, phonenumber, birthday) VALUES ($1, $2, $3, $4, $5)`,
            [username, hash, email, phonenumber, birthday]
        );

        res.send("Registrering lyckades!");
    } catch (err) {
        console.error(err);
        if(err.code === '23505') {
            res.status(400).send("Användarnamnet finns redan!");
        } else {
            res.status(400).send("Användarnamnet finns redan eller fel i databasen");
        }
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send("Saknas username eller password");

    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user) return res.status(400).send("Fel användarnamn eller lösenord");

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.send("Inloggning lyckades!");
        } else {
            res.status(400).send("Fel användarnamn eller lösenord");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Fel vid databasförfrågan");
    }
});

// Starta server
app.listen(PORT, () => {
    console.log(`Servern kör på http://localhost:${PORT}`);
});
