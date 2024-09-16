const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//path to database file
const dbPath = path.join(__dirname, '"C:\Users\kegar\OneDrive - Ouachita Baptist University\Documents\CapstoneProject\capstone-registration-system-repo\DBeaver\Production\registration-sample-DB-Production"');


//helps us know if the database will open or not 
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

module.exports = db;
