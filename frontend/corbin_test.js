const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
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

//Route for ?? page 
app.get('/faculty/:professor_id', (req, res) => {
  const studentListQuery = `SELECT * FROM Persons WHERE Advisor IS "${req.params.professor_id}"`;
  const userNameQuery = `SELECT * FROM Persons Where Person_ID IS "${req.params.professor_id}"`;

  db.all(studentListQuery, [], (err, studentList) => {
    if (err) {
      console.error('Error retrieving student list:', err);
      return res.status(500).send('Error retrieving student list');
    }
    db.all(userNameQuery, [], (err, userName) => {
      if (err) {
        console.error('Error retrieving name:', err);
        return res.status(500).send('Error retrieving name');
      }
      res.render('student_list', {
        User: userName,
        StudentList: studentList,
      });
    });
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

//Changes first or last name
app.post('/change-name', (req, res) => {
  const { student_id, professor_id, first_name, last_name } = req.body;

  if (first_name == undefined) {
    changeNameQuery = `
    UPDATE Persons
    SET Last_Name = "${last_name}"
    WHERE Person_ID IS "${student_id}"
  `;
    db.run(changeNameQuery, [], function (err) {
      if (err) {
        console.error('Error changing name:', err.message);
        return res.status(500).send('Error changing name');
      }

      res.redirect('/faculty/edit_student/' + student_id);
    });
  } else if (last_name == undefined) {
    changeNameQuery = `
    UPDATE Persons
    SET First_Name = "${first_name}"
    WHERE Person_ID IS "${student_id}"
  `;
    db.run(changeNameQuery, [], function (err) {
      if (err) {
        console.error('Error changin name:', err.message);
        return res.status(500).send('Error changing name');
      }

      res.redirect('/faculty/edit_student/' + student_id);
    });
  }
});

//Set a students classification/Group
app.post('/change-group', (req, res) => {
  const { student_id, professor_id, group } = req.body;
  console.log(group);
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

    res.redirect('/faculty/edit_student/' + student_id);
  });
});

//Changes the email
app.post('/change-email', (req, res) => {
  const { student_id, professor_id, email } = req.body;

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

    res.redirect('/faculty/edit_student/' + student_id);
  });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
