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
  //Query returns all information of registered times for specific advisor
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

 //Editing Meeting Times
 app.get('/faculty/edit_meeting_time/:professor_id/:date/:time', (req, res) => {
  const { professor_id, date, time } = req.params;

  const meetingQuery = `
    SELECT * FROM RegistrationList 
    WHERE Professor_ID IS "${professor_id}" 
    AND Date_Available IS "${date}" 
    AND Time IS "${time}"
  `;

  db.all(meetingQuery, [], (err, meeting) => {
    if (err) {
      console.error('Error retrieving the meeting:', err);
      return res.status(500).send('Error retrieving the meeting');
    }

    if (meeting.length === 0) {
      return res.status(404).send('Meeting time not found');
    }

    res.render('edit_meeting_times', {
      Meeting: meeting[0], // Use the first result
    });
  });
});

// Updating Meeting Times
app.post('/update-meeting', (req, res) => {
  const { professor_id, old_date, old_time, new_date, new_time } = req.body;

  // Check if the user provided new values
  if (!new_date || !new_time) {
    return res.status(400).send('New date and time are required');
  }

  const updateQuery = `
    UPDATE RegistrationList
    SET Date_Available = "${new_date}", Time = "${new_time}"
    WHERE Professor_ID IS "${professor_id}" 
    AND Date_Available IS "${old_date}"
    AND Time IS "${old_time}"
  `;

  db.run(updateQuery, [], function (err) {
    if (err) {
      console.error('Error updating meeting time:', err.message);
      return res.status(500).send('Error updating meeting time');
    }

    res.redirect('/faculty'); // Redirect back to faculty dashboard after update
    });



  const getUniqueKeyQuery = `
  SELECT Unique_Key
  FROM Persons
  WHERE Person_ID IS "${professor_id}"
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
    Where "Group" != "Professor" AND Unique_Key = "${req.params.stu_id}"
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
});


// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
