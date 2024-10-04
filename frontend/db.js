const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const app = express();

//path to database file
const dbPath = './DBeaver/Production/registration-sample-DB-Production.db';


//helps us know if the database will open or not 
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

let sqlQuery = `SELECT * FROM Persons`;

db.all(sqlQuery, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row);
  });
});

// this will start the server 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/',(req, res) => {
  res.send('Running from db.js');
});

// close the database connection
db.close();


module.exports = db;
