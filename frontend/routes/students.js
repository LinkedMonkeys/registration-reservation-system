// routes/students.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(
  __dirname,
  '..',
  '..',
  'database',
  'Production',
  'registration-sample-DB-Production.db'
);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening database:', err.message);
  else console.log('Connected to the SQLite database (student).');
});

// Student dashboard
router.get('/:student_key', (req, res) => {
  const studentSqlQuery = `
    SELECT * FROM Persons WHERE "Group" != "Professor" AND Unique_Key="${req.params.student_key}"
  `;
  const validateStudentQuery = `
    SELECT Unique_Key FROM Persons WHERE "Group" != "Professor" AND Unique_Key="${req.params.student_key}"
  `;
  const meetingTimesQuery = `
  SELECT *
  FROM RegistrationList
  WHERE Professor_ID = (SELECT Advisor FROM Persons WHERE Unique_Key = "${req.params.student_key}")
`;


  const currentMeetingQuery = `
    SELECT * FROM RegistrationList WHERE Student_ID="${req.params.student_key}"
  `;

  console.log("Query:", meetingTimesQuery);

  const checkIfRequestedQuery = `
    SELECT * FROM RegistrationList WHERE Student_ID="${req.params.student_key}"
  `;
  const checkGroupEligibleQuery = `
    SELECT Student_ID as sid FROM RegistrationList
    JOIN (SELECT Unique_Key as uk FROM Persons
          WHERE "Group" = (SELECT "Group" FROM Persons WHERE Unique_Key="${req.params.student_key}"))
    WHERE sid = uk;
  `;

  db.get(validateStudentQuery, (err, student_key) => {
    if (err) return res.status(500).send('Error retrieving data from database');
    if (student_key) {
      db.all(studentSqlQuery, [], (err, name_entries) => {
        db.all(meetingTimesQuery, [], (err, time_info) => {
          db.all(currentMeetingQuery, [], (err, current_time) => {
            db.get(checkIfRequestedQuery, (err, time_requested) => {
              db.get(checkGroupEligibleQuery, (err, group_tag) => {
                res.render('student_view_main', {
                  student_key: req.params.student_key,
                  name_entries,
                  time_info,
                  time_requested,
                  current_time,
                  group_tag,
                });
              });
            });
          });
        });
      });
    } else res.render('invalid_key', { key: req.params.student_key });
  });
});

// Register time
router.post('/register-time', (req, res) => {
  const { advisor, date, time, student_key } = req.body;
  const registerQuery = `
    UPDATE RegistrationList
    SET Student_ID="${student_key}"
    WHERE Professor_ID="${advisor}" AND Date_Available="${date}" AND Time="${time}" AND Student_ID="Available_Key"
  `;
  const findAllRegistrationsQuery = `
    UPDATE RegistrationList
    SET Student_ID="Available_Key"
    WHERE Student_ID="${student_key}"
  `;
  db.run(findAllRegistrationsQuery, [], (err) => {
    db.run(registerQuery, [], (err) => {});
  });
  res.redirect(`/student_main/${student_key}`);
});

module.exports = router;
