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

//Route to faculty dashboard, requires a unique key //STICH IN KRIS'S TIME VIEWS
app.get('/faculty_main/:fac_key', (req, res) => {
  //Query returns all information of students under a specific advisor
  const studentInfoSqlQuery =
    `SELECT *
    FROM Persons
    Where Advisor = (
    SELECT Person_ID 
    FROM Persons
    WHERE Unique_Key = "${req.params.fac_key}"
    )`
  //same for time
    const timeInfoSqlQuery = `
    SELECT * 
    FROM RegistrationList 
    WHERE Professor_ID = (
      SELECT Person_ID 
      FROM Persons 
      WHERE Unique_Key = "${req.params.fac_key}"
    )
  `;

  //Query validates a fac_key to determine whether it is a real key belonging
  //to a professor in the database.
  const validateFacultyQuery =
    `SELECT *
    FROM Persons
    WHERE Unique_Key = "${req.params.fac_key}" AND "Group" = "Professor"
    `
  // console.log(validateFacultyQuery);
  //Runs validateFacultyQuery
  db.get(validateFacultyQuery, (err, fac_info) => {
    if (err) {
      console.log("Error accessing database.")
      return res.status(500).send('Error retrieving data from database');
    }

    if (fac_info) { // If validateFacultyQuery was successful...
      console.log(fac_info);
      db.all(studentInfoSqlQuery, [], (err, student_info) => {
        if (err) {
          console.log("Error accessing database.")
          return res.status(500).send('Error retrieving data from database');
        }

        //same thing but for times
        db.all(timeInfoSqlQuery, [], (err, availableTimes) => {
          if (err) {
            console.log("Error retrieving available meeting times.");
            return res.status(500).send('Error retrieving available times');
          }

        if (student_info) { // If studentInfoSqlQuery was successful...
          console.log(student_info);
          // This asks the .js to render views/faculty_view_main.ejs. 
          res.render('faculty_view_main', { 

            //Easier to read this way
            fac_info: fac_info, 
            student_info: student_info,
            availableTimes: availableTimes
          
          });
        } else {
          res.render('invalid_key', { key: req.params.fac_key });
        }
      }); });
    } else {
      //If an invalid fac_id is submitted, the user will be directed to views/invalid_key.ejs.
      console.log("Invalid key used on /faculty_main.");
      res.render('invalid_key', { key: req.params.fac_key });
    }
  });
});


//Route for editing students page 
app.get('/faculty/edit_student/:student_id', (req, res) => {
  const studentQuery = `SELECT * FROM Persons WHERE Person_ID IS "${req.params.student_id}"`;

  db.all(studentQuery, [], (err, student) => {
    if (err) {
      console.error('Error retrieving the student:', err);
      return res.status(500).send('Error retrieving the student');
    }

    res.render('edit_student', {
      Student: student,
    });
  });
});

//Updates student information
app.post('/update-student', (req, res) => {
  const { student_id, first_name, last_name, group, email, fac_id } = req.body;

  if (first_name != "") {
    changeFirstNameQuery = `
    UPDATE Persons
    SET First_Name = "${first_name}"
    WHERE Person_ID IS "${student_id}"
    `;
    db.run(changeFirstNameQuery, [], function (err) {
      if (err) {
        console.error('Error changing name:', err.message);
        return res.status(500).send('Error changing name');
      }
    });
  }
  if (last_name != "") {
    changeLastNameQuery = `
    UPDATE Persons
    SET Last_Name = "${last_name}"
    WHERE Person_ID IS "${student_id}"
    `;
    db.run(changeLastNameQuery, [], function (err) {
      if (err) {
        console.error('Error changing name:', err.message);
        return res.status(500).send('Error changing name');
      }
    });
  }
  if (group != "") {
    changeGroupQuery = `
    UPDATE Persons
    SET "Group" = "${group}"
    WHERE Person_ID IS "${student_id}"
    `;
    db.run(changeGroupQuery, [], function (err) {
      if (err) {
        console.error('Error changing classification:', err.message);
        return res.status(500).send('Error changing classification');
      }
    });
  }
  if (email != "") {
    changeEmailQuery = `
    UPDATE Persons
    SET Email = "${email}"
    WHERE Person_ID IS "${student_id}"
    `;
    db.run(changeEmailQuery, [], function (err) {
      if (err) {
        console.error('Error changing email:', err.message);
        return res.status(500).send('Error changing email');
      }
    });
  }

  const getUniqueKeyQuery = `
  SELECT Unique_Key
  FROM Persons
  WHERE Person_ID IS "${fac_id}"
  `;
  db.all(getUniqueKeyQuery, [], (err, fac) => {
    if (err) {
      console.error('Error retrieving the student:', err);
      return res.status(500).send('Error retrieving the student');
    }

    res.redirect('/faculty_main/' + fac[0].Unique_Key);
  });
});

//Route to student registration dashboard, requires a unique key
app.get('/student_dashboard/:stu_id', (req, res) => {
  //Query returns the full name of the student who matches the input id.
  const studentSqlQuery =
    `SELECT First_Name, Last_Name
    FROM Persons
    Where "Group" != "Professor" AND Unique_Key = "${req.params.stu_id}"
    `
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