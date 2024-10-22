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