const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const db = require("./database");
const path = require("path");


const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Servern fungerar!");
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) return res.status(400).send("Saknas username eller password");

    const hash = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function(err) {
        if(err) {
            return res.status(400).send("Användarnamnet finns redan");
        }
        res.send("Registrering lyckades!");
    });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) return res.status(400).send("Saknas username eller password");

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
        if(!row) return res.status(400).send("Fel användarnamn eller lösenord");

        const match = await bcrypt.compare(password, row.password);
        if(match) {
            res.send("Inloggning lyckades!");
        } else {
            res.status(400).send("Fel användarnamn eller lösenord");
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servern kör på http://localhost:${PORT}`);
});