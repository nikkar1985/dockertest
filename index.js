const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;



app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('
           <!DOCTYPE html> 
           <html>
           <head>
           <link rel="stylesheet" href="/style.css">
    </head>
    <body>
           
           <h1>  Hello World αυτή είναι η δευτερή μας εφαρμογή τρέχει μέσω Docker & Render!</h1>
  <p> New line </p>
    </body>
    </html>
    
  ');
});

app.listen(PORT, () => {
  console.log(`Το application ξεκίνησε στην πόρτα ${PORT}`);
});
