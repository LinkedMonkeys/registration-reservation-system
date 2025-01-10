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

// Main page route where available registration times are listed
app.get('/', (req, res) => {
  const personsQuery = `SELECT * FROM Persons`;
  db.all(personsQuery, [], (err, personsRows) => {
    if (err) {
      return res.status(500).send('Error retrieving data from Persons table');
    }

    const registrationListQuery = `SELECT * FROM RegistrationList WHERE Student_ID IS NULL`;
    db.all(registrationListQuery, [], (err, registrationListRows) => {
      if (err) {
        return res.status(500).send('Error retrieving data from RegistrationList table');
      }

      const date_requested = null;
      const time_requested = null;

      //passing me(Kristopher) as a place holder
      const person = personsRows.length > 0 ? personsRows[3]: null;

      res.render('request_time_kris', { 
        key: null, 
        Persons: person,  
        RegistrationList: registrationListRows,
        time_entries: registrationListRows ,
        date_requested: date_requested,
        time_requested: time_requested
      });
    });
  });
});

//Route for faculty page 
app.get('/faculty', (req, res) => {
  const registrationListQuery = `SELECT * FROM RegistrationList WHERE Student_ID IS NULL`;

  db.all(registrationListQuery, [], (err, availableSlots) => {
    if (err) {
      console.error('Error retrieving available slots:', err);
      return res.status(500).send('Error retrieving available slots');
    }

    const studentRegistrationsQuery = `SELECT * FROM RegistrationList WHERE Student_ID IS NOT NULL`;

    db.all(studentRegistrationsQuery, [], (err, studentRegistrations) => {
      if (err) {
        console.error('Error retrieving student registrations:', err);
        return res.status(500).send('Error retrieving student registrations');
      }

      res.render('faculty_dashboard_kris', {
        RegistrationList: studentRegistrations,
        availableSlots: availableSlots,
      });
    });
  });
});




//Route for faculty to handle unregistering a student from their current registration
app.post('/unregister', (req, res) => {
  const { student_id, current_date, current_time } = req.body;

  const unregisterQuery = `
    UPDATE RegistrationList
    SET Student_ID = NULL
    WHERE Date_Available = ? AND Time = ? AND Student_ID = ?
  `;

  db.run(unregisterQuery, [current_date, current_time, student_id], function(err) {
    if (err) {
      console.error("Error unregistering student:", err);
      return res.status(500).send('Error unregistering');
    }

    res.send(`You have successfully unregistered from ${current_date} at ${current_time}. You can now select a new slot.`);
  });
});


//Route for faculty adding  time slots
app.post('/add-time-slot', (req, res) => {
  const { date, time } = req.body;

  const addSlotQuery = `
    INSERT INTO RegistrationList (Date_Available, Time, Student_ID) 
    VALUES (?, ?, NULL)
  `;
  
  db.run(addSlotQuery, [date, time], function(err) {
    if (err) {
      console.error('Error adding time slot:', err.message);
      return res.status(500).send('Error adding time slot');
    }
    
    res.redirect('/faculty');
  });
});


// //Route for faculty deleting a time slots
app.post('/delete-time-slot', (req, res) => {
  const { date, time } = req.body;

  const deleteSlotQuery = `
    DELETE FROM RegistrationList
    WHERE Date_Available = ? AND Time = ?
  `;
  
  db.run(deleteSlotQuery, [date, time], function(err) {
    if (err) {
      console.error('Error deleting time slot:', err.message);
      return res.status(500).send('Error deleting time slot');
    }

    res.redirect('/faculty');
  });
});

// Route to handle registering a student for a new time slot
app.post('/register', (req, res) => {
  const { student_id, new_date, new_time } = req.body;

  const checkQuery = `SELECT * FROM RegistrationList WHERE Student_ID = ?`;
  
  db.get(checkQuery, [student_id], (err, row) => {
    if (err) {
      console.error("Error checking student registration:", err);
      return res.status(500).send('Error checking registration');
    }

    if (row) {
      return res.status(400).send('You are already registered. Please change your existing registration.');
    }

    const checkSlotQuery = `SELECT * FROM RegistrationList WHERE Date_Available = ? AND Time = ? AND Student_ID IS NULL`;

    db.get(checkSlotQuery, [new_date, new_time], (err, row) => {
      if (err) {
        console.error("Error checking slot availability:", err);
        return res.status(500).send('Error checking slot availability');
      }

      if (!row) {
        return res.status(400).send('The selected slot is no longer available');
      }

      const updateQuery = `
        UPDATE RegistrationList
        SET Student_ID = ?
        WHERE Date_Available = ? AND Time = ?
      `;

      db.run(updateQuery, [student_id, new_date, new_time], function(err) {
        if (err) {
          console.error("Error updating registration slot:", err);
          return res.status(500).send('Error registering for the selected time');
        }

        res.send(`You have successfully registered for ${new_date} at ${new_time}`);
      });
    });
  });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
