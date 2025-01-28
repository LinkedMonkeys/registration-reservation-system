const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const { name } = require('ejs');
const app = express();

app.set('view engine', 'ejs');


//Is needed to use POST 
app.use(express.urlencoded({ extended: true })); 

// Path to connect to the database
const dbPath = './DBeaver/Production/registration-sample-DB-Production.db';

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

//Route to faculty dashboard, requires a unique key //NEEDS VALIDATION FOR CREDENTIALS
app.get('/faculty_main/:fac_id', (req,res) => {
const sqlQuery = 
`SELECT First_Name, Last_Name
FROM Persons
Where Advisor = (
SELECT Person_ID 
FROM Persons
WHERE "Key/URL_Specific" = "${req.params.fac_id}"
)`
console.log(sqlQuery);

db.all(sqlQuery, [], (err, name_entries) => {
    if (err) {
      return res.status(500).send('Error retrieving data from database');
    }
  
    if (name_entries) { // If the query was successful...
        console.log(name_entries);
      
        // This asks it to render views/faculty_view_main.ejs. 
        res.render('faculty_view_main', {fac_id: req.params.fac_id, name_entries: name_entries});
    } else {
      res.render('invalid_key');
    }
  });
});

//app.get()

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });