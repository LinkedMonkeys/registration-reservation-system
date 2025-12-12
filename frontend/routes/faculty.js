// routes/faculty.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const generateUniqueKeysInASetFunction = require('../../Functions/GenerateUniqueKeyFunction');

const dbUtils = require('../../database/dbFunctions/dbUtils.js');
const {Tables, Columns} = require('../../database/dbFunctions/dbSructure.js');


// Edit student route
router.get('/:fac_key/edit', async (req, res) => {
	try {
		const studentInfoRows = await dbUtils.FilterGetTable(Tables.PERSONS, Columns.PERSONS.ADVISOR, req.params.fac_key);

		res.render('bulkStudentEdit', {
			Student: studentInfoRows,
			Fac_key: req.params.fac_key
		});
					
		

	} catch (err) {
		console.log(`Error with the /fac/key/edit end point ${err}`);
	}
});


//Update student info 
router.post('/:fac_key/edit/:student_key', async (req, res) => {
	try {
		// new field values from user
		const {Group, Last_Name, First_Name, Email, Unique_Key, Advisor} = req.body;
		const newFields = {Group, Last_Name, First_Name, Email, Unique_Key, Advisor};


		// existing field values
		const oldFields = await dbUtils.FilterGetTable(Tables.PERSONS, Columns.PERSONS.UNIQUE_KEY, req.params.student_key);

		const updatedFields = {};

		for (const key in newFields) {
			const incoming = newFields[key];

			if (incoming != '') {
				if (incoming != oldFields[key]) {
					updatedFields[key] = incoming;
				}
			}
		}

		for (const key in updatedFields) {
			//update db function: id key, field name, field value
			await dbUtils.dbUtils.UpdateStudent(req.params.student_key, key, updatedFields[key]);
		}
		res.redirect(`/faculty_main/${req.params.fac_key}/edit`);
		
	} catch (err) {
		console.log(`Error with EditStudent Function: ${err}`)
	}
});


// Links view
router.get('/links_view/:fac_key', (req, res) => {
  const validateFacultyQuery = `
    SELECT * FROM Persons
    WHERE Unique_Key = "${req.params.fac_key}" AND "Group" = "Professor"
  `;
  dbUtils.db.get(validateFacultyQuery, (err, fac_info) => {
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
  dbUtils.db.run(deleteStudent);
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
  dbUtils.db.run(addStudent);
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
  dbUtils.db.all(meetingQuery, [], (err, meeting) => {
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
  dbUtils.db.run(addSpecificTimeQuery);
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
  dbUtils.db.run(deleteQuery);
  res.redirect(`/faculty_main/${fac_key}`);
});

// Add time slots (bulk)
router.post('/add-time', (req, res) => {
  console.log('Adding time slots:');
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
  dbUtils.db.run(addTimeQuery);
  res.redirect(`/faculty_main/${fac_key}`);
});

// Restart semester
router.get('/:fac_key/restart', (req, res) => {
  const fac_key = req.params.fac_key;
  const deleteQuery = `DELETE FROM RegistrationList WHERE Professor_ID="${fac_key}"`;
  dbUtils.db.run(deleteQuery);
  res.redirect('/faculty_main/' + fac_key);
});

// Route to faculty dashboard
router.get('/:fac_key', async (req, res) => {
	try {
		//query to validate faculty key
		const facultyKeyValidate = await dbUtils.GetPersonByGroup(req.params.fac_key, 'Professor');

		// if facultyKeyValidate returns nothing or has no match
		if (!facultyKeyValidate || facultyKeyValidate.length === 0) {
			return res.status(401).send('Invalid Faculty Key');
		}

		//query to get students info for associated fac_key
		const studentInfoRows = await dbUtils.FilterGetTable(Tables.PERSONS, Columns.PERSONS.ADVISOR, req.params.fac_key);

		// query to get registration times for the associated fac_key
		const registrationTimes = await dbUtils.GetTimesByProfesor(req.params.fac_key);

		console.log(facultyKeyValidate);


		res.render('faculty_view_main', {
              //Values to pass into the .ejs.
			  fac_key: req.params.fac_key,
              fac_info: facultyKeyValidate,
              student_info: studentInfoRows,
              time_info: registrationTimes
            });
		} catch (err) {
			console.log(`error retreiving data for faculty view: ${err}`)
			res.status(404).send(`${err}`)
		}

});

// SEND EMAIL — Show form
router.get('/send_email/:student_key', (req, res) => {
  const studentQuery = `
    SELECT * FROM Persons WHERE Unique_Key="${req.params.student_key}"
  `;
  dbUtils.db.get(studentQuery, [], (err, student) => {
    if (err || !student) return res.render('invalid_key', { key: req.params.student_key });
    res.render('send_email', { student });
  });
});

// SEND EMAIL — Handle submission (for now, console log)
router.post('/send_email', (req, res) => {
  const { email, subject, message, fac_key } = req.body;

  console.log("\n--- EMAIL SENT (Test) ---");
  console.log("To:", email);
  console.log("Subject:", subject);
  console.log("Message:\n", message);
  console.log("------------------------------\n");

  res.redirect(`/faculty_main/${fac_key}`);
});

module.exports = router;
