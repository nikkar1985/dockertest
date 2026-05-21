const express = require('express');
const { Pool } = require('pg'); // Εισαγωγή του PostgreSQL package
const app = express();

// Ορίζουμε την πόρτα (χρήσιμο για το Render)
const PORT = process.env.PORT || 3000;

// Ρύθμιση της σύνδεσης με την PostgreSQL μέσω της μεταβλητής DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Απαραίτητο για να επιτρέπει το Render την ασφαλή σύνδεση
    }
});

// Σύνδεση με τον φάκελο public για το CSS
app.use(express.static('public'));

app.get('/', async (req, res) => {
    let dbMessage = "";

    // Δοκιμαστικό ερώτημα στη βάση δεδομένων
    try {
        const result = await pool.query('SELECT NOW()');
        dbMessage = `✅ Επιτυχής σύνδεση! Ώρα βάσης: ${result.rows[0].now}`;
    } catch (err) {
        console.error(err);
        dbMessage = `❌ Αποτυχία σύνδεσης: ${err.message}`;
    }

    // Διαβάζουμε τη μεταβλητή περιβάλλοντος MESSAGE
    const message = process.env.MESSAGE || "Η Docker εφαρμογή μας λειτουργεί!";

    // Χρησιμοποιούμε backticks ( ` ) για το HTML
    res.send(`
<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker Lesson</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div class="container" style="font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <h1>🚀 ${message}</h1>
        <p>Αυτή η σελίδα τρέχει μέσα από ένα Docker Container!</p>
        
        <div style="background: #f4f4f4; padding: 15px; margin-top: 20px; border-left: 5px solid #007bff; color: #333;">
            <strong>Κατάσταση PostgreSQL:</strong> <br> ${dbMessage}
        </div>
    </div>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Το application ξεκίνησε στην πόρτα ${PORT}`);
});
