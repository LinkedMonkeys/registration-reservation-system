const {Tables, Columns} = require('../../database/dbFunctions/dbSructure.js');
const dbUtils = require('../../database/dbFunctions/dbUtils.js');

const express = require('express');
const router = express.Router();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function HomeRoute(req, res) {
	res.render('root');
}


// TODO: change the edit screen to a single form that sends json
// to the back end and then make fewer DB calls

// route for /faculty/:fac_key/edit/:studetn_key
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

			if (incoming != oldFields[key]) {
				updatedFields[key] = incoming;
			}
		}

		for (const key in updatedFields) {
			//update db function: id key, field name, field value
			await dbUtils.UpdateStudent(req.params.student_key, key, updatedFields[key]);
		}
		res.send('Update Success')
		
	} catch (err) {
		console.log(`Error with EditStudent Function: ${err}`)
	}
});

router.get('/:fac_key/edit', async (req, res) => {
	try {
		const studentInfoRows = await dbUtils.FilterGetTable(Tables.PERSONS, Columns.PERSONS.ADVISOR, req.params.fac_key);
		console.log(studentInfoRows);

		res.render('bulkStudentEdit', {
			Student: studentInfoRows,
			Fac_key: req.params.fac_key
		});
					
		

	} catch (err) {
		console.log(`Error with the /fac/key/edit end point ${err}`);
	}
});

// route for: /faculty/:fac_key
// when the request is made, it takes fac_key and checks it against the database 
// if it passes the check, it displays the table
router.get('/:fac_key', async (req, res) => {
	try {
		//query to validate faculty key
		const facultyKeyValidate = await dbUtils.GetPersonByGroup(
			req.params.fac_key, 'Professor'
		);

		// if facultyKeyValidate returns nothing or has no match
		if (!facultyKeyValidate || facultyKeyValidate.length === 0) {
			return res.status(401).send('Invalid Faculty Key');
		}

		//query to get students info for associated fac_key
		const studentInfoRows = await dbUtils.FilterGetTable(Tables.PERSONS, Columns.PERSONS.pr);

		// query to get registration times for the associated fac_key
		const registrationTimes = await dbUtils.GetTimesByProfesor(req.params.fac_key);

		res.render('faculty_view_main', {
              //Values to pass into the .ejs.
              fac_info: facultyKeyValidate,
              student_info: studentInfoRows,
              time_info: registrationTimes
            });
		} catch (err) {
			console.log(`error retreiving data for faculty view: ${err}`)
			res.status(404).send(`${err}`)
		}
});

async function TestGet(req, res) {
	try {
	} catch (err) {
		res.send('error');
	}
}

module.exports = router;
