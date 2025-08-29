const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const { name } = require('ejs');
const app = express();

app.set('view engine', 'ejs');


//Is needed to use POST 
app.use(express.urlencoded({ extended: true })); 

// Path to connect to the database
const dbPath = './database/Production/registration-sample-DB-Production.db';

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// //Route to faculty dashboard, requires a unique key //NEEDS VALIDATION FOR CREDENTIALS
// app.get('/clear_and_add_queries/:User', (req,res) => {
// const sqlQuery = 
// `SELECT First_Name, Last_Name
// FROM Persons
// Where Advisor = (
// SELECT Person_ID 
// FROM Persons
// WHERE "Key/URL_Specific" = "${req.params.fac_id}"
// )`
// console.log(sqlQuery);

// db.all(sqlQuery, [], (err, name_entries) => {
//     if (err) {
//       return res.status(500).send('Error retrieving data from database');
//     }
  
//     if (name_entries) { // If the query was successful...
//         console.log(name_entries);
        
//         // This asks it to render views/faculty_view_main.ejs. 
//         res.render('clear_and_add_queries', {User: req.params.User, StudentList: StudentList});
//     } else {
//       res.render('invalid_key');
//     }
//   });
// });

//Test route
app.get('/faculty_main/:fac_id/:ID_no', (req,res) => {
  const sqlQuery = 
  `SELECT First_Name, Last_Name
FROM Persons
Where Advisor = (
SELECT Person_ID 
FROM Persons
WHERE "Key/URL_Specific" = "${req.params.fac_id}"
)`
const deleteQuery =  `DELETE FROM RegistrationList
  Where Professor_ID = "${req.params.ID_no}"`
  console.log(sqlQuery);
  console.log(deleteQuery);
  
  db.all(deleteQuery, [], (err, name_entries) => {
      if (err) {
        return res.status(500).send('Error retrieving data from database');
      }
    
      if (name_entries) { // If the query was successful...
          console.log(name_entries);
        
          // This asks it to render views/faculty_view_main.ejs. 
          res.render('faculty_view_main', {fac_id: req.params.fac_id, name_entries: name_entries});
      } else {
        res.render('invalid_key');
      }
    });
  });

// function wipe_database(ID_no){
//   const delete_query = 
//   `DELETE FROM Registration_List
//   WHERE Professor_ID == ${ID_no}`;
//   console.log(delete_query);
//     console.log("Successfully deleted all entries under user " + ID_no);
//     console.log(rows)

// }
function add_entry(prof_ID, date, time, student_ID, classification){
db.query(`INSERT INTO RegistrationList ${(Professor_ID, Date_Available, Time, Student_ID, classification)}`, (err,rows)); {
  if (err) {
    return res.status(500).send('Error retrieving data from database');
  }
  console.log("Successfully added a new time slot to the table");
  console.log(rows);
}
}
// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });

// Testing
// console.log(wipe_database(1));