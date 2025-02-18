const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const { name } = require('ejs');
const app = express();

//Set up for .ejs
app.set('view engine', 'ejs');

// Require the 'generateUniqueKeysInASet' function from 'generateUniqueKeyFunction.js'
const generateUniqueKeysInASetFunction = require('../functions/generateUniqueKeyFunction');

//Set up for app.post
app.use(express.urlencoded({ extended: true }));

// Path to connect to the database
const dbPath = './DBeaver/Production/registration-sample-DB-Production.db';

// Opens the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

//Route to faculty dashboard, requires a unique key 
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
      console.log("Error accessing database => validateFacultyQuery.")
      return res.status(500).send('Error retrieving data from database');
    }

    if (fac_info) { // If validateFacultyQuery was successful...
      console.log(fac_info);
      //Attempts to request student information from the database.
      db.all(studentInfoSqlQuery, [], (err, student_info) => {
        if (err) {
          console.log("Error accessing database => studentInfoQuery.")
          return res.status(500).send('Error retrieving data from database');
        }

        //Attempts to request meeting time information from the database.
        db.all(timeInfoQuery, [], (err, time_info) => {
          if (err) {
            console.log("Error retrieving available meeting times => timeInfoQuery.");
            return res.status(500).send('Error retrieving available times');
          }

          if (student_info && time_info) { // If studentInfoSqlQuery & timeInfoQuery was successful...
            // console.log(student_info);
            // This asks the .js to render views/faculty_view_main.ejs. 
            res.render('faculty_view_main', {
              //Values to pass into the .ejs.
              fac_info: fac_info,
              student_info: student_info,
              time_info: time_info

            });
          } else {
            //If connnection to the database was unsuccessful, send the user to the invalid screen.
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

//Route for editing students.
app.get('/faculty_main/edit_student/:student_key', (req, res) => {
  //Query gathers all information about the selected student from the database.
  const studentQuery =
    `SELECT * 
    FROM Persons
    WHERE Unique_Key IS "${req.params.student_key}"
    `;

  //Attempts to request information for a specific student from the database.
  db.all(studentQuery, [], (err, student) => {
    if (err) {
      console.error('Error retrieving the student:', err);
      return res.status(500).send('Error retrieving the student');
    }

    //Takes user to the edit_student.ejs view.
    res.render('edit_student', {
      //Information passed to the .ejs.
      Student: student,
    });
  });
});

//Updates student's information.
app.post('/update-student', (req, res) => {
  const { student_key, first_name, last_name, group, email, fac_key } = req.body;

  //Checks the first name field for changes.
  if (first_name != "") {
    //If changes are found, changes are put into query.
    changeFirstNameQuery =
      `UPDATE Persons
      SET First_Name = "${first_name}"
      WHERE Unique_Key IS "${student_key}"
      `;
    //The query is run to attempt sending the update to the database.
    db.run(changeFirstNameQuery, [], function (err) {
      if (err) {
        console.error('Error changing name:', err.message);
        return res.status(500).send('Error changing name');
      }
    });
  }
  //Checks the last name field for changes.
  if (last_name != "") {
    //If changes are found, changes are put into query.
    changeLastNameQuery =
      `UPDATE Persons
      SET Last_Name = "${last_name}"
      WHERE Unique_Key IS "${student_key}"
    `;
    //The query is run to attempt sending the update to the database.
    db.run(changeLastNameQuery, [], function (err) {
      if (err) {
        console.error('Error changing name:', err.message);
        return res.status(500).send('Error changing name');
      }
    });
  }
  //Checks the group field for changes.
  if (group != "") {
    //If changes are found, changes are put into query.
    changeGroupQuery =
      `UPDATE Persons
      SET "Group" = "${group}"
      WHERE Unique_Key IS "${student_key}"
      `;
    //The query is run to attempt sending the update to the database.
    db.run(changeGroupQuery, [], function (err) {
      if (err) {
        console.error('Error changing classification:', err.message);
        return res.status(500).send('Error changing classification');
      }
    });
  }
  //Checks the email field for changes.
  if (email != "") {
    //If changes are found, changes are put into query.
    changeEmailQuery =
      `UPDATE Persons
      SET Email = "${email}"
      WHERE Unique_Key IS "${student_key}"
      `;
    //The query is run to attempt sending the update to the database.
    db.run(changeEmailQuery, [], function (err) {
      if (err) {
        console.error('Error changing email:', err.message);
        return res.status(500).send('Error changing email');
      }
    });
  }
  //When the updates are finished, the user is sent back to faculty_main.ejs view.
  res.redirect('/faculty_main/' + fac_key);
});

//Needs its view added to faculty_main. Check the faculty.ejs form.

app.get('/faculty_main/links_view/:fac_key', (req,res) =>{
  //Query validates a fac_key to determine whether it is a real key belonging
  //to a professor in the database.
  const validateFacultyQuery =
    `SELECT *
    FROM Persons
    WHERE Unique_Key = "${req.params.fac_key}" AND "Group" = "Professor"
    `
  db.get(validateFacultyQuery, (err, fac_info) => {
    if (err) {
      console.log("Error accessing database => validateFacultyQuery.")
      return res.status(500).send('Error retrieving data from database');
    }
    if (fac_info) {
      res.render('links_view');
      // fac_info: fac_info;
    } else {
      //If connnection to the database was unsuccessful, send the user to the invalid screen.
      res.render('invalid_key', { key: req.params.fac_key });
    }
  });
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

//Route for editing meeting times.
app.get('/faculty_main/edit_meeting_time/:fac_key/:date/:time', (req, res) => {
  //Query gathers all information about the selected meeting time, where 
  //the associated professor matches the requested time.
  const meetingQuery =
    `SELECT * FROM RegistrationList
    WHERE Professor_ID IS "${req.params.fac_key}" 
    AND Date_Available IS "${req.params.date}" 
    AND Time IS "${req.params.time}"
  `;
  //Attempts to request information from the database.
  db.all(meetingQuery, [], (err, meeting) => {
    console.log(meeting);
    if (err) {
      console.error('Error retrieving the meeting:', err);
      return res.status(500).send('Error retrieving the meeting');
    }
    //Checks if the query has any information
    if (meeting.length === 0) {
      return res.status(404).send('Meeting time not found');
    }
    //Sends the user to the edit_meeting_time.ejs view.
    res.render('edit_meeting_time', {
      //Information passed to the .ejs.
      Meeting: meeting
    });
  });
});

// Updates meeting times.
app.post('/update-meeting', (req, res) => {
  const { fac_key, old_date, old_time, new_date, new_time } = req.body;
  console.log(req.body);
  // Checks if the user provided new values
  if (!new_date || !new_time) {
    return res.status(400).send('New date and time are required');
  }
  //Query gathers the information from the existing meeting time, then 
  //updates the old fields with the new inputs from the user for
  //the associated professor.
  const updateQuery =
    `UPDATE RegistrationList
    SET Date_Available = "${new_date}", Time = "${new_time}"
    WHERE Professor_ID IS "${fac_key}" 
    AND Date_Available IS "${old_date}"
    AND Time IS "${old_time}"
  `;
  console.log(updateQuery, "should see something");
  //Attempts to update the database.
  db.run(updateQuery, [], function (err) {
    if (err) {
      console.error('Error updating meeting time:', err.message);
      return res.status(500).send('Error updating meeting time');
    }
  });
  //When the updates are finished, the user is sent back to faculty_main.ejs view.
  res.redirect(`/faculty_main/${fac_key}`);
});

app.get('/faculty_main/:fac_key/add_time', (req, res) => {
  res.render('add_time', {
    fac_key: req.params.fac_key,
  });
});

app.post('/add-time', (req, res) => {
  const { fac_key, date, group } = req.body;

  addTime =
    `INSERT INTO RegistrationList ("Professor_ID", "Date_Available", "Time", "Student_ID", "Group") VALUES
    ("${fac_key}", "${date}", "0800", "Available_Key", "${group}"),
    ("${fac_key}", "${date}", "0830", "Available_Key", "${group}"),
    ("${fac_key}", "${date}", "0900", "Available_Key", "${group}"),
    ("${fac_key}", "${date}", "0930", "Available_Key", "${group}"),
    ("${fac_key}", "${date}", "1000", "Available_Key", "${group}")
  `;

  var sql =
    `INSERT INTO RegistrationList ("Professor_ID", "Date_Available", "Time", "Student_ID", "Group") VALUES
    `;

  for (i = 1030; i < 1700; i += 30) {
    addTime = addTime + `,("${fac_key}", "${date}", "${i}", "Available_Key", "${group}")
    `
    i = i + 70;
    addTime = addTime + `,("${fac_key}", "${date}", "${i}", "Available_Key", "${group}")
    `
  };

  addTime = addTime + `;`

  console.log(sql);
  console.log(addTime);


  db.run(addTime, [], (err) => {
    if (err) {
      console.error('Error updating meeting time:', err.message);
      return res.status(500).send('Error updating meeting time');
    }
  });
  //When the updates are finished, the user is sent back to faculty_main.ejs view.
  res.redirect(`/faculty_main/${fac_key}`);

  // for (; time < 1730; time = time + 30) {
  //   db.run(addTime, [], (err) => {
  //     if (err) {
  //       return res.status(500).send('Error adding data to the database');
  //     }
  //   });
  //   console.log(addTime);
  // };
  // res.redirect('/faculty_main/' + fac_key);
});


// Route for deleting table for new semester.
app.get('/faculty_main/:fac_key/restart', (req, res) => {
  const fac_key = req.params.fac_key;

  const deleteQuery = `DELETE FROM RegistrationList WHERE Professor_ID = "${fac_key}"`;

  console.log(deleteQuery);

  db.run(deleteQuery, [], (err) => {
    if (err) {
      return res.status(500).send('Error deleting data from database');
    }
    res.redirect('/faculty_main/' + fac_key);
  });
});





//Route to student registration dashboard, requires a unique key | NEEDS WORK!!!
app.get('/student_main/:student_key', (req, res) => {
  //Query returns the full name of the student who matches the student key.
  const studentSqlQuery =
    `SELECT *
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
  //Temp query for retrieving all the meeting times from the database.
  const meetingTimesQuery =
    `SELECT *
    FROM RegistrationList
    `
  const currentMeetingQuery =
    `SELECT *
     FROM RegistrationList
     WHERE Student_ID = "${req.params.student_key}"
    `
  const checkGroupEligibleQuery =
    `SELECT Student_ID as sid
     FROM RegistrationList
     JOIN (SELECT Unique_Key as uk
	         FROM Persons
	         WHERE "Group" = (SELECT "Group"
						                FROM Persons
						                WHERE Unique_Key = "${req.params.student_key}"))
     WHERE sid = uk;
    `
  console.log(checkGroupEligibleQuery);
  //Query checks to see if a given unique key has a registered time in
  //the database.
  const checkIfRequestedQuery =
    `SELECT *
     FROM RegistrationList
     WHERE Student_ID = "${req.params.student_key}"
    `
  //Attempts to request information from the database.
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

        //Attempts to request meeting time information from the database.
        db.all(meetingTimesQuery, [], (err, time_info) => {
          if (err) {
            console.log("Error retrieving available meeting times => meetingTimesQuery.");
            return res.status(500).send('Error retrieving available times');
          }
          //Attempts to request meeting time information from the database.
          db.all(currentMeetingQuery, [], (err, current_time) => {
            console.log(current_time);
            if (err) {
              console.log("Error retrieving available meeting times => meetingTimesQuery.");
              return res.status(500).send('Error retrieving available times');
            }

            if (name_entries && time_info) { // If the studentSqlQuery, meetingTimesQuery, and studentCurrentMeetingQuery were successful...
              console.log(name_entries);
              console.log("time_info: " + time_info);
              //Attempts to request a row with a given key from the database.
              db.get(checkIfRequestedQuery, (err, time_requested) => {
                console.log('time_requested info: ' + time_requested);
                if (err) {
                  console.log("Error retrieving available meeting times => checkIfRequestedQuery.");
                  return res.status(500).send('Error retrieving requested time.');
                }
                db.get(checkGroupEligibleQuery, (err, group_tag) => {
                  console.log(group_tag);
                  if (err) {
                    console.log("Error finding group => checkGroupEligibleQuery.");
                    return res.status(500).send('Error finding group.');
                  }
                  res.render('student_view_main', {
                    student_key: req.params.student_key,
                    name_entries: name_entries,
                    time_info: time_info,
                    time_requested: time_requested,
                    current_time: current_time,
                    group_tag: group_tag
                  });
                });
              });
            } else {
              res.render('invalid_key', { key: req.params.student_key });
            }
          });
        });
      });
    } else {
      console.log("Invalid key used on /student_main => validateStudentQuery.");
      res.render('invalid_key', { key: req.params.student_key });
    }
  });
});

app.post('/register-time', (req, res) => {
  const { advisor, date, time, student_key } = req.body;
  console.log(req.body);
  //Query updates the RegistrationList so the row's Student_ID is
  //changed to the given student_key.
  const registerQuery =
    `UPDATE RegistrationList
   SET Student_ID = "${student_key}"
   WHERE Professor_ID = "${advisor}"
   AND Date_Available = "${date}"
   AND Time = "${time}"
   AND Student_ID = 'Available_Key'
  `
  const findAllRegistrationsQuery =
    `UPDATE RegistrationList
   SET Student_ID = 'Available_Key'
   WHERE Student_ID = "${student_key}"
   `
  console.log(findAllRegistrationsQuery);
  console.log(registerQuery);
  db.run(findAllRegistrationsQuery, [], function (err) {
    if (err) {
      console.error('Error finding existing meeting times.', err.message);
      return res.status(500).send('Error finding existing meeting times.');
    }
    db.run(registerQuery, [], function (err) {
      if (err) {
        console.error('Error registering for meeting time:', err.message);
        return res.status(500).send('Error registering for meeting time.');
      }
    })
  })
  //When the updates are finished, the user is sent back to student_main.ejs view.
  res.redirect(`/student_main/${student_key}`);
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});