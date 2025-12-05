// routes/admin.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const generateUniqueKeysInASetFunction = require('../../Functions/GenerateUniqueKeyFunction');

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
  else console.log('Connected to the SQLite database (admin).');
});

// Admin dashboard
router.get('/:admin_key', (req, res) => {
  const adminKey = req.params.admin_key;
  const validateAdminQuery = `
    SELECT * FROM Persons WHERE Unique_Key="${adminKey}" AND "Group"="Admin"
  `;
  db.get(validateAdminQuery, (err, admin_info) => {
    if (err || !admin_info) return res.render('invalid_key', { key: adminKey });
    res.render('admin_dashboard', { admin_info });
  });
});

// Manage professors
router.get('/:admin_key/manage_professors', (req, res) => {
  const adminKey = req.params.admin_key;
  const validateAdminQuery = `
    SELECT * FROM Persons WHERE Unique_Key="${adminKey}" AND "Group"="Admin"
  `;
  const getProfessorsQuery = `
    SELECT * FROM Persons WHERE "Group"="Professor"
  `;
  db.get(validateAdminQuery, (err, admin_info) => {
    if (err || !admin_info) return res.render('invalid_key', { key: adminKey });
    db.all(getProfessorsQuery, [], (err, professors) => {
      res.render('admin_manage_professors', { admin_info, professors });
    });
  });
});

// Add professor
router.post('/add-professor', (req, res) => {
  const { first_name, last_name, email, admin_key } = req.body;
  const newKey = generateUniqueKeysInASetFunction();
  const addProfessorQuery = `
    INSERT INTO Persons ("Group", "Last_Name", "First_Name", "Email", "Unique_Key", "Advisor")
    VALUES ("Professor", "${last_name}", "${first_name}", "${email}", "${newKey}", "None")
  `;
  db.run(addProfessorQuery);
  res.redirect(`/admin/${admin_key}/manage_professors`);
});

// Delete professor
router.post('/delete-professor', (req, res) => {
  const { prof_key, admin_key } = req.body;
  const deleteProfessorQuery = `
    DELETE FROM Persons WHERE Unique_Key="${prof_key}" AND "Group"="Professor"
  `;
  db.run(deleteProfessorQuery);
  res.redirect(`/admin/${admin_key}/manage_professors`);
});

// View all meetings
router.get('/:admin_key/all_meetings', (req, res) => {
  const adminKey = req.params.admin_key;
  const validateAdminQuery = `
    SELECT * FROM Persons WHERE Unique_Key="${adminKey}" AND "Group"="Admin"
  `;
  const allMeetingsQuery = `
    SELECT rl.*, p.First_Name, p.Last_Name
    FROM RegistrationList rl
    JOIN Persons p ON rl.Professor_ID = p.Unique_Key
  `;
  db.get(validateAdminQuery, (err, admin_info) => {
    if (err || !admin_info) return res.render('invalid_key', { key: adminKey });
    db.all(allMeetingsQuery, [], (err, meetings) => {
      res.render('admin_meetings_view', { admin_info, meetings });
    });
  });
});

module.exports = router;
