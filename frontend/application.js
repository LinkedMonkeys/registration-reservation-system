const express = require('express');
const app = express();
const db = require('./frontend/db'); 

// middleware to parse JSON bodies
app.use(express.json());

// placeholder data
app.get('/data', (req, res) => {
  db.all('SELECT * FROM table', [], (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching data.');
      return;
    }
    res.json(rows);
  });
});

// this will start the server 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

