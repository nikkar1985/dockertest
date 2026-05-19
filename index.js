const express = require('express');
const app = express();

// Ορίζουμε την πόρτα (χρήσιμο για το Render)
const PORT = process.env.PORT || 3000;

// Σύνδεση με τον φάκελο public για το CSS
app.use(express.static('public'));

app.get('/', (req, res) => {
    // Διαβάζουμε τη μεταβλητή περιβάλλοντος MESSAGE
    const message = process.env.MESSAGE || "Η Docker εφαρμογή μας λειτουργεί!";

    // ΠΡΟΣΟΧΗ: Χρησιμοποιούμε backticks ( ` ) για να επιτρέπεται η αλλαγή γραμμής στο HTML
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
    <div class="container">
        <h1>🚀 ${message}</h1>
        <p>Αυτή η σελίδα τρέχει μέσα από ένα Docker Container!</p>
    </div>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Το application ξεκίνησε στην πόρτα ${PORT}`);
});
