require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require("path");
const multer = require("multer");

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Multer för profilbilder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});
const upload = multer({ storage });

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;

// === Root route ===
app.get("/", (req, res) => {
    res.json({ message: "Servern fungerar!" });
});

// === Hämta användardata ===
app.get("/user/:username", async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "Saknas username" });

    try {
        const result = await db.query("SELECT username, profile_picture FROM users WHERE username = $1", [username]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Användare finns inte" });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fel vid databasförfrågan" });
    }
});

// === REGISTER ===
app.post("/register", upload.single("profile_picture"), async (req, res) => {
    const { username, password, email, phonenumber, birthday } = req.body;
    const profile_picture = req.file ? req.file.filename : null;

    if (!username || !password)
        return res.status(400).json({ success: false, message: "Saknas username eller password" });

    try {
        const hash = await bcrypt.hash(password, 10);
        await db.query(
            `INSERT INTO users (username, password, email, phonenumber, birthday, profile_picture)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [username, hash, email, phonenumber, birthday, profile_picture]
        );

        res.json({ success: true, message: "Registrering lyckades!" });
    } catch (err) {
        console.error(err);
        if (err.code === "23505") {
            res.status(400).json({ success: false, message: "Användarnamnet finns redan!" });
        } else {
            res.status(500).json({ success: false, message: "Fel i databasen eller indata." });
        }
    }
});

// === LOGIN ===
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ success: false, message: "Saknas username eller password" });

    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user)
            return res.status(400).json({ success: false, message: "Fel användarnamn eller lösenord" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(400).json({ success: false, message: "Fel användarnamn eller lösenord" });

        // ✅ Skicka JSON med användardata
        res.json({
            success: true,
            message: "Inloggning lyckades!",
            userData: {
                id: user.id,
                username: user.username,
                email: user.email,
                profile_picture: user.profile_picture,
                bio: user.bio
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Fel vid databasförfrågan" });
    }
});


// === Starta server ===
app.listen(PORT, () => {
    console.log(`Servern kör på http://localhost:${PORT}`);
});
