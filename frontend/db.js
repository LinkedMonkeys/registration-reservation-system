const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const app = express();

//sets EJS as template engine
app.set('view engine', 'ejs');


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


app.get('/', (req, res) => {
  const sqlQuery = `SELECT * FROM Persons`;

  //gets data from the database 
  db.all(sqlQuery, [], (err, rows) => {
    if (err) {
      return res.status(500).send('Error retrieving data from database');
    }
    
    //give the data to the ejs template "registration_frontend"
    res.render('registration_frontend', { persons: rows });
  });
});

// this will start the server 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//no point in closing the database if it'll close on its own once we close the application.