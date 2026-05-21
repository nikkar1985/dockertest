const express = require('express');
const { Pool } = require('pg');
const app = express();

const PORT = process.env.PORT || 3000;

// Σύνδεση με την PostgreSQL στο Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ΑΥΤΟΜΑΤΟ SETUP: Φτιάχνει τον πίνακα των μηνυμάτων αν δεν υπάρχει
async function setupDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Ο πίνακας μηνυμάτων είναι έτοιμος!");
    } catch (err) {
        console.error("Σφάλμα στο setup της βάσης:", err);
    }
}
setupDatabase();

// Απαραίτητο για να μπορεί το Express να διαβάσει τα δεδομένα της φόρμας (POST)
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 1. GET URL: Εμφάνιση της σελίδας και όλων των μηνυμάτων
app.get('/', async (req, res) => {
    let dbStatus = "✅ Συνδέθηκε επιτυχώς!";
    let messagesHTML = "";

    try {
        // Παίρνουμε όλα τα μηνύματα, με τα πιο πρόσφατα πρώτα
        const result = await pool.query("SELECT username, text, to_char(created_at, 'DD/MM HH:MI') as time FROM messages ORDER BY id DESC");
        
        if (result.rows.length === 0) {
            messagesHTML = `<p style="color: #777; font-style: italic;">Δεν υπάρχουν μηνύματα ακόμα. Γράψε το πρώτο!</p>`;
        } else {
            // Φτιάχνουμε το HTML για κάθε μήνυμα ξεχωριστά
            result.rows.forEach(row => {
                messagesHTML += `
                    <div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 10px; margin-bottom: 10px; text-align: left; border-radius: 0 8px 8px 0;">
                        <strong style="color: #333;">${row.username}</strong> 
                        <span style="font-size: 11px; color: #999; float: right;">${row.time}</span>
                        <p style="margin: 5px 0 0 0; color: #555;">${row.text}</p>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error(err);
        dbStatus = `❌ Σφάλμα βάσης: ${err.message}`;
        messagesHTML = `<p style="color: red;">Αποτυχία φόρτωσης μηνυμάτων.</p>`;
    }

    const message = process.env.MESSAGE || "Η Docker εφαρμογή μας λειτουργεί!";

    res.send(`
<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker & PostgreSQL Message Board</title>
</head>
<body style="font-family: sans-serif; background: #f0f2f5; padding: 20px; margin: 0; display: flex; justify-content: center;">
    
    <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; width: 100%; max-width: 500px;">
        <h1 style="color: #007bff; margin-bottom: 5px;">🚀 ${message}</h1>
        <p style="color: #555; margin-top: 0;">Live Τοίχος Μηνυμάτων στην PostgreSQL!</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
        
        <form action="/add-message" method="POST" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px;">
            <input type="text" name="username" placeholder="Το όνομά σου" required style="padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;">
            <textarea name="text" placeholder="Γράψε ένα μήνυμα..." required style="padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; resize: none; height: 60px;"></textarea>
            <button type="submit" style="background: #007bff; color: white; border: none; padding: 10px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">Δημοσίευση ✨</button>
        </form>

        <h3 style="text-align: left; color: #333; margin-bottom: 15px;">📥 Πρόσφατα Μηνύματα:</h3>
        
        <div style="max-height: 300px; overflow-y: auto; padding-right: 5px;">
            ${messagesHTML}
        </div>
        
        <div style="background: #e8f5e9; padding: 8px; border-radius: 6px; font-size: 13px; color: #1b5e20; margin-top: 25px;">
            <strong>Κατάσταση Βάσης:</strong> ${dbStatus}
        </div>
    </div>

</body>
</html>
    `);
});

// 2. POST URL: Εδώ έρχονται τα δεδομένα όταν ο χρήστης πατάει το κουμπί
app.post('/add-message', async (req, res) => {
    const { username, text } = req.body;

    try {
        // Ασφαλές INSERT στη βάση χρησιμοποιώντας παραμετροποιημένο ερώτημα ($1, $2) για αποφυγή SQL Injection
        await pool.query('INSERT INTO messages (username, text) VALUES ($1, $2)', [username, text]);
    } catch (err) {
        console.error("Αποτυχία αποθήκευσης μηνύματος:", err);
    }

    // Μόλις αποθηκευτεί, ξαναστέλνουμε τον χρήστη στην αρχική σελίδα
    res.redirect('/');
});

// Εκκίνηση του Server
app.listen(PORT, () => {
    console.log(`Ο Server τρέχει στη θύρα ${PORT}`);
});
