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

//Route to faculty dashboard, requires a unique key //STICH IN CORBIN'S STUDENT VIEWS AND KRIS'S TIME VIEWS
app.get('/faculty_main/:fac_id', (req, res) => {
  //Query returns the full names of students under specific advisor
  const facultySqlQuery =
    `SELECT First_Name, Last_Name
FROM Persons
Where Advisor = (
SELECT Person_ID 
FROM Persons
WHERE "Key/URL_Specific" = "${req.params.fac_id}"
)`
  // console.log(facultySqlQuery);
  //Query validates a fac_id to determine whether it is a real key belonging
  //to a professor in the database.
  const validateFacultyQuery =
    `SELECT Person_ID 
FROM Persons
WHERE "Key/URL_Specific" = "${req.params.fac_id}" AND "Group" = "Professor"
`
  // console.log(validateFacultyQuery);
  //Runs validateFacultyQuery
  db.get(validateFacultyQuery, (err, professor_id) => {
    if (err) {
      console.log("Error accessing database.")
      return res.status(500).send('Error retrieving data from database');
    }

    if (professor_id) { // If validateFacultyQuery was successful...
      console.log(professor_id);
      db.all(facultySqlQuery, [], (err, name_entries) => {
        if (err) {
          console.log("Error accessing database.")
          return res.status(500).send('Error retrieving data from database');
        }

        if (name_entries) { // If facultySqlQuery was successful...
          console.log(name_entries);
          // This asks the .js to render views/faculty_view_main.ejs. 
          res.render('faculty_view_main', { fac_id: req.params.fac_id, name_entries: name_entries });
        } else {
          res.render('invalid_key', { key: req.params.fac_id });
        }
      });
    } else {
      //If an invalid fac_id is submitted, the user will be directed to views/invalid_key.ejs.
      console.log("Invalid key used on /faculty_main.");
      res.render('invalid_key', { key: req.params.fac_id });
    }
  });
});

//Route to student registration dashboard, requires a unique key
app.get('/student_dashboard/:stu_id', (req, res) => {
  //Query returns the full name of the student who matches the input id.
  const studentSqlQuery =
    `SELECT First_Name, Last_Name
  FROM Persons
  Where "Group" != "Professor" AND "Key/URL_Specific" = "${req.params.stu_id}"
  `
  // console.log(studentSqlQuery);

  //Query validates a stu_id to determine whether it is a real key belonging
  //to a student in the database.
  const validateStudentQuery =
    `SELECT Person_ID 
 FROM Persons
  Where "Group" != "Professor" AND "Key/URL_Specific" = "${req.params.stu_id}"
`
  db.get(validateStudentQuery, (err, student_id) => {
    if (err) {
      console.log("Error accessing database.")
      return res.status(500).send('Error retrieving data from database');
    }

    if (student_id) { // If validateStudentQuery was successful...
      console.log(student_id);
      // This asks the .js to render views/student_view_main.ejs. 
      db.all(studentSqlQuery, [], (err, name_entries) => {
        if (err) {
          console.log("Error accessing database.")
          return res.status(500).send('Error retrieving data from database');
        }

        if (name_entries) { // If the query was successful...
          console.log(name_entries);
          res.render('student_view_main', { stu_id: req.params.stu_id, name_entries: name_entries });
        } else {
          res.render('invalid_key', { key: req.params.stu_id });
        }

      });
    } else {
      console.log("Invalid key used on /student_dashboard.");
      res.render('invalid_key', { key: req.params.stu_id });
    }
  });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});