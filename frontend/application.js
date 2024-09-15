const express = require('express');
const app = express();
const db = require('./frontend/db'); // Adjust the path if needed

// Middleware to parse JSON bodies
app.use(express.json());

// Example endpoint to get data from the database
app.get('/data', (req, res) => {
  db.all('SELECT * FROM your_table_name', [], (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching data.');
      return;
    }
    res.json(rows);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

