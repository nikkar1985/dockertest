const express = require('express');
const { Pool } = require('pg');
const app = express();

const PORT = process.env.PORT || 3000;

// Σύνδεση με την PostgreSQL στο Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ΑΥΤΟΜΑΤΟ SETUP: Φτιάχνει έναν πίνακα για τις επισκέψεις αν δεν υπάρχει ήδη
async function setupDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS visits (
                id SERIAL PRIMARY KEY,
                count INT NOT NULL
            );
        `);
        // Αν ο πίνακας είναι άδειος, βάζουμε την πρώτη καταγραφή (0 επισκέψεις)
        const res = await pool.query('SELECT * FROM visits');
        if (res.rows.length === 0) {
            await pool.query('INSERT INTO visits (count) VALUES (0)');
        }
        console.log("Η βάση δεδομένων είναι έτοιμη!");
    } catch (err) {
        console.error("Σφάλμα στο setup της βάσης:", err);
    }
}
setupDatabase();

app.use(express.static('public'));

app.get('/', async (req, res) => {
    let visitsCount = 0;
    let dbStatus = "✅ Συνδέθηκε επιτυχώς!";

    try {
        // 1. Αυξάνουμε τον μετρητή κατά +1 στην PostgreSQL και παίρνουμε το νέο νούμερο
        const result = await pool.query('UPDATE visits SET count = count + 1 RETURNING count');
        visitsCount = result.rows[0].count;
    } catch (err) {
        console.error(err);
        dbStatus = `❌ Σφάλμα βάσης: ${err.message}`;
    }

    const message = process.env.MESSAGE || "Η Docker εφαρμογή μας λειτουργεί!";

    res.send(`
<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker & PostgreSQL Lesson</title>
</head>
<body style="font-family: sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
    
    <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; max-width: 400px;">
        <h1 style="color: #007bff; margin-bottom: 10px;">🚀 ${message}</h1>
        <p style="color: #555;">Αυτό το Container τρέχει live στο Render!</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        
        <h2 style="margin: 0; color: #333;">Συνολικές Επισκέψεις:</h2>
        <div style="font-size: 48px; font-weight: bold; color: #28a745; margin: 10px 0;">
            ${visitsCount}
        </div>
        <p style="font-size: 12px; color: #777;">(Κάνε refresh τη σελίδα για να δεις τον αριθμό να μεγαλώνει!)</p>
        
        <div style="background: #e8f5e9; padding: 8px; border-radius: 6px; font-size: 13px; color: #1b5e20; margin-top: 20px;">
            <strong>Κατάσταση Βάσης:</strong> ${dbStatus}
        </div>
    </div>

</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Το application ξεκίνησε στην πόρτα ${PORT}`);
});
