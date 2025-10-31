// routes/faculty.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const generateUniqueKeysInASetFunction = require('../../Functions/GenerateUniqueKeyFunction');


const dbPath = '../database/Production/registration-sample-DB-Production.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening database:', err.message);
  else console.log('Connected to the SQLite database (faculty).');
});

// Route to faculty dashboard
router.get('/:fac_key', (req, res) => {
  const studentInfoSqlQuery = `
    SELECT * FROM Persons WHERE Advisor = "${req.params.fac_key}"
  `;
  const timeInfoQuery = `
    SELECT * FROM RegistrationList rl 
    JOIN (SELECT * FROM Persons) as p
    WHERE rl.Professor_ID == "${req.params.fac_key}" AND rl.Student_ID = p.Unique_Key;
  `;
  const validateFacultyQuery = `
    SELECT * FROM Persons
    WHERE Unique_Key = "${req.params.fac_key}" AND "Group" = "Professor"
  `;

  db.get(validateFacultyQuery, (err, fac_info) => {
    if (err) return res.status(500).send('Error retrieving data from database');
    if (fac_info) {
      db.all(studentInfoSqlQuery, [], (err, student_info) => {
        if (err) return res.status(500).send('Error retrieving data from database');
        db.all(timeInfoQuery, [], (err, time_info) => {
          if (err) return res.status(500).send('Error retrieving times');
          if (student_info && time_info) {
            res.render('faculty_view_main', {
              fac_info,
              student_info,
              time_info,
            });
          } else {
            res.render('invalid_key', { key: req.params.fac_key });
          }
        });
      });
    } else {
      res.render('invalid_key', { key: req.params.fac_key });
    }
  });
});

// Edit student route
router.get('/edit_student/:student_key', (req, res) => {
  const studentQuery = `
    SELECT * FROM Persons WHERE Unique_Key IS "${req.params.student_key}"
  `;
  db.all(studentQuery, [], (err, student) => {
    if (err) return res.status(500).send('Error retrieving student');
    res.render('edit_student', { Student: student });
  });
});

// Update student info
router.post('/update-student', (req, res) => {
  const { student_key, first_name, last_name, group, email, fac_key } = req.body;
  const updates = [];

  if (first_name)
    updates.push(`UPDATE Persons SET First_Name="${first_name}" WHERE Unique_Key="${student_key}"`);
  if (last_name)
    updates.push(`UPDATE Persons SET Last_Name="${last_name}" WHERE Unique_Key="${student_key}"`);
  if (group)
    updates.push(`UPDATE Persons SET "Group"="${group}" WHERE Unique_Key="${student_key}"`);
  if (email)
    updates.push(`UPDATE Persons SET Email="${email}" WHERE Unique_Key="${student_key}"`);

  updates.forEach((q) => db.run(q));
  res.redirect('/faculty_main/' + fac_key);
});

// Links view
router.get('/links_view/:fac_key', (req, res) => {
  const validateFacultyQuery = `
    SELECT * FROM Persons
    WHERE Unique_Key = "${req.params.fac_key}" AND "Group" = "Professor"
  `;
  db.get(validateFacultyQuery, (err, fac_info) => {
    if (err) return res.status(500).send('Error retrieving data');
    if (fac_info) res.render('links_view');
    else res.render('invalid_key', { key: req.params.fac_key });
  });
});

// Delete student
router.post('/delete-student', (req, res) => {
  const { student_key, fac_key } = req.body;
  const deleteStudent = `
    DELETE FROM Persons WHERE Unique_Key IS "${student_key}"
  `;
  db.run(deleteStudent);
  res.redirect('/faculty_main/' + fac_key);
});

// Add student form
router.get('/add_student/:fac_key', (req, res) => {
  res.render('add_student', { fac_key: req.params.fac_key });
});

// Add student logic
router.post('/add-student', (req, res) => {
  const { first_name, last_name, group, email, fac_key } = req.body;
  const addStudent = `
    INSERT INTO Persons ("Group", "Last_Name", "First_Name", "Email", "Unique_Key", "Advisor")
    VALUES("${group}", "${last_name}", "${first_name}", "${email}", "${generateUniqueKeysInASetFunction()}", "${fac_key}")
  `;
  db.run(addStudent);
  res.redirect('/faculty_main/' + fac_key);
});

// Edit meeting time
router.get('/edit_meeting_time/:fac_key/:date/:time', (req, res) => {
  const meetingQuery = `
    SELECT * FROM RegistrationList
    WHERE Professor_ID IS "${req.params.fac_key}" 
    AND Date_Available IS "${req.params.date}" 
    AND Time IS "${req.params.time}"
  `;
  db.all(meetingQuery, [], (err, meeting) => {
    if (err) return res.status(500).send('Error retrieving meeting');
    if (meeting.length === 0) return res.status(404).send('Meeting time not found');
    res.render('edit_meeting_time', { Meeting: meeting });
  });
});

// Update meeting
router.post('/update-meeting', (req, res) => {
  const { fac_key, old_date, old_time, new_date, new_time } = req.body;
  const updateQuery = `
    UPDATE RegistrationList
    SET Date_Available="${new_date}", Time="${new_time}"
    WHERE Professor_ID="${fac_key}" 
    AND Date_Available="${old_date}"
    AND Time="${old_time}"
  `;
  db.run(updateQuery);
  res.redirect(`/faculty_main/${fac_key}`);
});

// Add time page
router.get('/:fac_key/add_time', (req, res) => {
  res.render('add_time', { fac_key: req.params.fac_key });
});

// Add specific time
router.post('/add-specific-time', (req, res) => {
  const { fac_key, date, time, group } = req.body;
  const addSpecificTimeQuery = `
    INSERT INTO RegistrationList ("Professor_ID", "Date_Available", "Time", "Student_ID", "Group") 
    VALUES ("${fac_key}", "${date}", "${time}", "Available_Key", "${group}")
  `;
  db.run(addSpecificTimeQuery);
  res.redirect(`/faculty_main/${fac_key}`);
});

// Delete times
router.post('/delete-times', (req, res) => {
  const { fac_key, time_slots } = req.body;
  const slotsArray = Array.isArray(time_slots) ? time_slots : [time_slots];
  const deleteConditions = slotsArray
    .map((slot) => {
      const [date, time] = slot.split('|');
      return `(Date_Available="${date}" AND Time="${time}")`;
    })
    .join(' OR ');
  const deleteQuery = `
    DELETE FROM RegistrationList 
    WHERE Professor_ID="${fac_key}" AND (${deleteConditions})
  `;
  db.run(deleteQuery);
  res.redirect(`/faculty_main/${fac_key}`);
});

// Add time slots (bulk)
router.post('/add-time', (req, res) => {
  const { fac_key, date, group } = req.body;

  function generateTimeSlots(startHour, endHour, intervalMinutes = 30) {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        if (hour === endHour && minute > 0) break;
        const timeStr = hour.toString().padStart(2, '0') + minute.toString().padStart(2, '0');
        slots.push(timeStr);
      }
    }
    return slots;
  }

  const timeSlots = generateTimeSlots(8, 17, 30);
  const values = timeSlots
    .map((time) => `("${fac_key}", "${date}", "${time}", "Available_Key", "${group}")`)
    .join(',\n    ');
  const addTimeQuery = `
    INSERT INTO RegistrationList ("Professor_ID", "Date_Available", "Time", "Student_ID", "Group") 
    VALUES ${values}
  `;
  db.run(addTimeQuery);
  res.redirect(`/faculty_main/${fac_key}`);
});

// Restart semester
router.get('/:fac_key/restart', (req, res) => {
  const fac_key = req.params.fac_key;
  const deleteQuery = `DELETE FROM RegistrationList WHERE Professor_ID="${fac_key}"`;
  db.run(deleteQuery);
  res.redirect('/faculty_main/' + fac_key);
});

module.exports = router;
