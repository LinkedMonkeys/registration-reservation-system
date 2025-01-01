const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const app = express();

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Path to database file
const dbPath = './DBeaver/Production/registration-sample-DB-Production.db';

// Helps us know if the database will open or not
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Route for the main page where available registration times are listed
app.get('/', (req, res) => {

  // Query the Persons table to fetch all persons
  const personsQuery = `SELECT * FROM Persons`;
  db.all(personsQuery, [], (err, personsRows) => {
    if (err) {
      return res.status(500).send('Error retrieving data from Persons table');
    }

    // Query the RegistrationList table to fetch all available registration slots
    const registrationListQuery = `SELECT * FROM RegistrationList`;
    db.all(registrationListQuery, [], (err, registrationListRows) => {
      if (err) {
        return res.status(500).send('Error retrieving data from RegistrationList table');
      }

      const time_entries = registrationListRows || [];

      // Render the view and pass the necessary data
      res.render('request_time_kris', { 
        Persons: personsRows, 
        RegistrationList: registrationListRows,
        time_entries: time_entries,
        date_requested: registrationListRows[0]?.Date_Available || null,
        time_requested: registrationListRows[0]?.Time || null
      });
    });
  });
});

// Route used to handle requests for a specific registration time by a student
app.get('/request_time_kris/:key/:date_requested?/:time_requested?', (req, res) => {
  const { key, date_requested, time_requested } = req.params;

  // Query the RegistrationList table to get the available registration slot
  const sqlQuery = `SELECT * FROM RegistrationList WHERE Date_Available = ? AND Time = ?`;
  const sqlParams = [date_requested, time_requested];

  // Fetch available registration slots for the requested date and time
  db.all(sqlQuery, sqlParams, (err, registrationListRows) => {
    if (err) {
      return res.status(500).send('Error retrieving data from RegistrationList table');
    }

    // Turns  Key/URL_Specific into key so it can be recognized
    const personQuery = `SELECT * FROM Persons WHERE "Key/URL_Specific" = ?`;
    db.get(personQuery, [key], (err, personRow) => {
      if (err) {
        return res.status(500).send('Error retrieving data from Persons table');
      }

      // Render the view, passing the necessary data
      res.render('request_time_kris', {
        key: key,   
        Persons: personRow, 
        time_entries: registrationListRows,  
        date_requested: date_requested, 
        time_requested: time_requested,  
      });
    });
  });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
