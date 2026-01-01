require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const db = require("./database");

// Allt detta är till Render
// const { Pool } = require("pg");
/*
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
*/

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
app.use(express.json());
app.use(bodyParser.text({ type: "text/*" }));
app.use(bodyParser.text({ type: "*/*" })); // tillfälligt för sendBeacon
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;

// === Root route ===
app.get("/", (req, res) => {
    res.json({ message: "The server works!" });
});


app.post("/test/message", async (req, res) => {
    try {
        const { room_id, sender, content } = req.body;

        await db.query(
            "INSERT INTO messages (room_id, sender, content) VALUES ($1, $2, $3)",
            [room_id, sender, content]
        );

        res.sendStatus(201);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Error saving message"});
    }
});

app.get("/test/messages/:room_id", async (req, res) => {
    try {
        const { room_id } = req.params;

        const result = await db.query(
            "SELECT sender, content, created_at FROM messages WHERE room_id = $1 ORDER BY created_at ASC",
            [room_id]
        );

        const messages = result.rows.map(r => ({
            sender: r.sender,
            content: r.content,
            created_at: r.created_at
        }));

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error retrieving messages" });
    }
});

// === Hämta användardata ===
app.get("/user/:username", async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "Username missing" });

    try {
        const result = await db.query("SELECT username, profile_picture FROM users WHERE username = $1", [username]);
        if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in database query" });
    }
});

// === REGISTER ===
app.post("/register", upload.single("profile_picture"), async (req, res) => {
    const { username, password, email, phonenumber, birthday } = req.body;
    const profile_picture = req.file ? req.file.filename : null;

    if (!username || !password)
        return res.status(400).json({ success: false, message: "Username or password missing" });

    try {
        const hash = await bcrypt.hash(password, 10);
        await db.query(
            `INSERT INTO users (username, password, email, phonenumber, birthday, profile_picture)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [username, hash, email, phonenumber, birthday, profile_picture]
        );

        res.json({ success: true, message: "Registration successful!" });
    } catch (err) {
        console.error(err);
        if (err.code === "23505") {
            res.status(400).json({ success: false, message: "Username already exists!" });
        } else {
            res.status(500).json({ success: false, message: "Error in database or input." });
        }
    }
});

// === LOGIN ===
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ success: false, message: "Username or password missing" });

    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user)
            return res.status(400).json({ success: false, message: "Wrong username or password" });

        // ✅ Kolla om användaren redan är inloggad
        if (user.is_logged_in) {
            return res.status(400).json({ success: false, message: "User logged in on another device" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(400).json({ success: false, message: "Wrong username or password" });

        // ✅ Sätt användaren som inloggad
        await db.query("UPDATE users SET is_logged_in = TRUE WHERE username = $1", [username]);

        res.json({
            success: true,
            message: "Login successful!",
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
        res.status(500).json({ success: false, message: "Error in database query" });
    }
});


app.post("/logout", async (req, res) => {
    try {
        const { userID } = req.body; // bodyParser/express.json har redan parsat JSON
        if (!userID) return res.status(400).json({ success: false, message: "userID missing" });

        await db.query("UPDATE users SET is_logged_in = FALSE WHERE id = $1", [userID]);

        res.json({ success: true, message: "Logout successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error logging out" });
    }
});







// === Starta server ===
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
