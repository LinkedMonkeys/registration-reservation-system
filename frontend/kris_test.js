const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');



// Path to help connect ejs to css. NOT WORKING 
app.use(express.static(__dirname + '/public'));

const dbPath = './DBeaver/Production/registration-sample-DB-Production.db';

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Main page route where available registration times are listed
app.get('/', (req, res) => {

  // Query to fetch all persons
  const personsQuery = `SELECT * FROM Persons`;
  db.all(personsQuery, [], (err, personsRows) => {
    if (err) {
      return res.status(500).send('Error retrieving data from Persons table');
    }

    // Query to fetch all available registration slots
    const registrationListQuery = `SELECT * FROM RegistrationList`;
    db.all(registrationListQuery, [], (err, registrationListRows) => {
      if (err) {
        return res.status(500).send('Error retrieving data from RegistrationList table');
      }

      // Set date and time to null before any selection
      const date_requested = null;
      const time_requested = null;

      // Render the page with available slots
      res.render('request_time_kris', { 
        key: null, 
        Persons: null, 
        RegistrationList: registrationListRows,
        time_entries: registrationListRows || [],
        date_requested: date_requested,
        time_requested: time_requested
      });
    });
  });
});





// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
