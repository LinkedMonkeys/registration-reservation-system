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


// Route used by students to request a registration time
// In this route, the question marks mean that date and time are optional.
app.get('/request_time/:key/:date_requested?/:time_requested?', (req, res) => {
  const sqlQuery = `SELECT * FROM Persons WHERE "KEY/URL_Specific"="${req.params.key}"`
  console.log(sqlQuery);
  db.all(sqlQuery, [], (err, rows) => {
    if (err) {
      return res.status(500).send('1Error retrieving data from database');
    }
  
    // Determine the student's Advisor's ID.
    if (rows[0]) {
      var advisor_id = rows[0]["Advisor"];
      console.log(rows[0]["Advisor"]);
      var studentGroup = rows[0]["Group"]
      const sqlQuery = `SELECT * FROM RegistrationList WHERE Professor_ID=${advisor_id} And "Group" = "${studentGroup}"`
      console.log(sqlQuery);
      db.all(sqlQuery, [], (err, time_entries) => {
        if (err) {
          return res.status(500).send('2Error retrieving data from database');
        }
        console.log(time_entries);
      
        // This asks it to render views/request_time.ejs.  It is passing the hash
        // as parameters to this script.
        res.render('request_time', {key: req.params.key, date_requested: req.params.date_requested, time_requested: req.params.time_requested, result: rows[0], time_entries: time_entries}, );
      });
    } else {
      res.render('invalid_key', {key: req.params.key});
    }
  });
});


// Old route for testing.
app.get('/testing_ids/:id', (req, res) => {
  const sqlQuery = `SELECT * FROM Persons WHERE "KEY/URL_Specific"="${req.params.id}"`
  db.all(sqlQuery, [], (err, rows) => {
    if (err) {
      return res.status(500).send('Error retrieving data from database');
    }
  
  // The first parameter to render connects to 'views/idtest.ejs'.
  // The second is a hash of parameters.  It is passing the 'id' from the route
  // (req.params.id) which will be named 'id' in the .ejs code.
  // The SQL query result (row 0, since it will be only one row) is being
  // passed and will be named 'result' on the .ejs side.
  res.render('idtest', { id: req.params.id, result: rows[0]});
  });
});


// this will start the server 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//no point in closing the database if it'll close on its own once we close the application.