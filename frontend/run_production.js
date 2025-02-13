const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const { name } = require('ejs');
const app = express();

app.set('view engine', 'ejs');

// Require the 'generateUniqueKeysInASet' function from 'generateUniqueKeyFunction.js'
const generateUniqueKeysInASetFunction = require('../functions/generateUniqueKeyFunction');

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
    Where Advisor = "${req.params.fac_key}"
    `
  //Query returns all information of registered times for specific advisor
  const timeInfoQuery =
    `SELECT *
    FROM RegistrationList rl 
    JOIN (SELECT *
    FROM Persons) as p
    WHERE rl.Professor_ID == "${req.params.fac_key}" AND rl.Student_ID = p.Unique_Key;
    `;
  //Query validates a fac_key to determine whether it is a real key belonging
  //to a professor in the database.
  const validateFacultyQuery =
    `SELECT *
    FROM Persons
    WHERE Unique_Key = "${req.params.fac_key}" AND "Group" = "Professor"
    `
  console.log(validateFacultyQuery + ' | validateFacultyQuery');
  //Runs validateFacultyQuery
  db.get(validateFacultyQuery, (err, fac_info) => {
    if (err) {
      console.log("Error accessing database | validateFacultyQuery.")
      return res.status(500).send('Error retrieving data from database');
    }

    if (fac_info) { // If validateFacultyQuery was successful...
      console.log(fac_info);
      db.all(studentInfoSqlQuery, [], (err, student_info) => {
        if (err) {
          console.log("Error accessing database | studentInfoQuery.")
          return res.status(500).send('Error retrieving data from database');
        }

        //same thing but for times
        db.all(timeInfoQuery, [], (err, time_info) => {
          if (err) {
            console.log("Error retrieving available meeting times | timeInfoQuery.");
            return res.status(500).send('Error retrieving available times');
          }

          if (student_info) { // If studentInfoSqlQuery was successful...
            // console.log(student_info);
            // This asks the .js to render views/faculty_view_main.ejs. 
            res.render('faculty_view_main', {
              //Easier to read this way
              fac_info: fac_info,
              student_info: student_info,
              time_info: time_info

            });
          } else {
            res.render('invalid_key', { key: req.params.fac_key });
          }
        });
      });
    } else {
      //If an invalid fac_key is submitted, the user will be directed to views/invalid_key.ejs.
      console.log("Invalid key used on /faculty_main.");
      res.render('invalid_key', { key: req.params.fac_key });
    }
  });
});

//Route for editing students page 
app.get('/faculty_main/edit_student/:student_key', (req, res) => {
  const studentQuery =
    `SELECT * 
    FROM Persons
    WHERE Unique_Key IS "${req.params.student_key}"
    `;

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
  const { student_key, first_name, last_name, group, email, fac_key } = req.body;

  if (first_name != "") {
    changeFirstNameQuery =
      `UPDATE Persons
      SET First_Name = "${first_name}"
      WHERE Unique_Key IS "${student_key}"
      `;
    db.run(changeFirstNameQuery, [], function (err) {
      if (err) {
        console.error('Error changing name:', err.message);
        return res.status(500).send('Error changing name');
      }
    });
  }
  if (last_name != "") {
    changeLastNameQuery =
      `UPDATE Persons
      SET Last_Name = "${last_name}"
      WHERE Unique_Key IS "${student_key}"
    `;
    db.run(changeLastNameQuery, [], function (err) {
      if (err) {
        console.error('Error changing name:', err.message);
        return res.status(500).send('Error changing name');
      }
    });
  }
  if (group != "") {
    changeGroupQuery =
      `UPDATE Persons
      SET "Group" = "${group}"
      WHERE Unique_Key IS "${student_key}"
      `;
    db.run(changeGroupQuery, [], function (err) {
      if (err) {
        console.error('Error changing classification:', err.message);
        return res.status(500).send('Error changing classification');
      }
    });
  }
  if (email != "") {
    changeEmailQuery =
      `UPDATE Persons
      SET Email = "${email}"
      WHERE Unique_Key IS "${student_key}"
      `;
    db.run(changeEmailQuery, [], function (err) {
      if (err) {
        console.error('Error changing email:', err.message);
        return res.status(500).send('Error changing email');
      }
    });
  }
  res.redirect('/faculty_main/' + fac_key);
});

//Deletes student information
app.post('/delete-student', (req, res) => {
  const { student_key, fac_key } = req.body;

  deleteStudent =
    `DELETE FROM Persons
    WHERE Unique_Key IS "${student_key}"
  `;

  db.run(deleteStudent, [], function (err) {
    if (err) {
      console.error('Error deleting student:', err.message);
      return res.status(500).send('Error deleting student');
    }
  });
  res.redirect('/faculty_main/' + fac_key);
});

//Route for adding students 
app.get('/faculty_main/add_student/:fac_key', (req, res) => {
  res.render('add_student', {
    fac_key: req.params.fac_key,
  });
});


//Adds student information
app.post('/add-student', (req, res) => {
  const { first_name, last_name, group, email, fac_key } = req.body;
  //inserts student data, including a new unique key
  addStudent =
    `INSERT INTO Persons ("Group", "Last_Name", "First_Name", "Email", "Unique_Key", "Advisor")
    VALUES("${group}", "${last_name}", "${first_name}", "${email}", "${generateUniqueKeysInASetFunction()}", "${fac_key}")
  `;

  db.run(addStudent, [], function (err) {
    if (err) {
      console.error('Error adding student:', err.message);
      return res.status(500).send('Error adding student');
    }
  });
  res.redirect('/faculty_main/' + fac_key);
});

//Editing Meeting Times
app.get('/faculty_main/edit_meeting_time/:fac_key/:date/:time', (req, res) => {
  const meetingQuery =
    `SELECT * FROM RegistrationList
    WHERE Professor_ID IS "${req.params.fac_key}" 
    AND Date_Available IS "${req.params.date}" 
    AND Time IS "${req.params.time}"
  `;

  db.all(meetingQuery, [], (err, meeting) => {
    console.log(meeting);
    if (err) {
      console.error('Error retrieving the meeting:', err);
      return res.status(500).send('Error retrieving the meeting');
    }

    if (meeting.length === 0) {
      return res.status(404).send('Meeting time not found');
    }

    res.render('edit_meeting_time', {
      Meeting: meeting
    });
  });
});

// Updating Meeting Times
app.post('/update-meeting', (req, res) => {
  const { fac_key, old_date, old_time, new_date, new_time } = req.body;
  console.log(req.body);
  // Check if the user provided new values
  if (!new_date || !new_time) {
    return res.status(400).send('New date and time are required');
  }

  const updateQuery =
    `UPDATE RegistrationList
    SET Date_Available = "${new_date}", Time = "${new_time}"
    WHERE Professor_ID IS "${fac_key}" 
    AND Date_Available IS "${old_date}"
    AND Time IS "${old_time}"
  `;
  console.log(updateQuery, "should see something");
  db.run(updateQuery, [], function (err) {
    if (err) {
      console.error('Error updating meeting time:', err.message);
      return res.status(500).send('Error updating meeting time');
    }
  });
  res.redirect(`/faculty_main/${fac_key}`);
});

//Route to student registration dashboard, requires a unique key
app.get('/student_main/:student_key', (req, res) => {
  //Query returns the full name of the student who matches the input id.
  const studentSqlQuery =
    `SELECT First_Name, Last_Name
    FROM Persons
    Where "Group" != "Professor" AND Unique_Key = "${req.params.student_key}"
    `
  //Query validates a student_key to determine whether it is a real key belonging
  //to a student in the database.
  const validateStudentQuery =
    `SELECT Unique_Key 
    FROM Persons
    Where "Group" != "Professor" AND Unique_Key = "${req.params.student_key}"
    `
  db.get(validateStudentQuery, (err, student_key) => {
    if (err) {
      console.log("Error accessing database.")
      return res.status(500).send('Error retrieving data from database');
    }

    if (student_key) { // If validateStudentQuery was successful...
      console.log(student_key);
      // This asks the .js to render views/student_view_main.ejs. 
      db.all(studentSqlQuery, [], (err, name_entries) => {
        if (err) {
          console.log("Error accessing database.")
          return res.status(500).send('Error retrieving data from database');
        }

        if (name_entries) { // If the query was successful...
          console.log(name_entries);
          res.render('student_view_main', { student_key: req.params.student_key, name_entries: name_entries });
        } else {
          res.render('invalid_key', { key: req.params.student_key });
        }

      });
    } else {
      console.log("Invalid key used on /student_dashboard.");
      res.render('invalid_key', { key: req.params.student_key });
    }
  });
});


// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
