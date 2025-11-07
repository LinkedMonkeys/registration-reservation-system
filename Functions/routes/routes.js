const {Tables, Columns} = require('../../database/dbFunctions/dbSructure.js');
const dbUtils = require('../../database/dbFunctions/dbUtils.js');
function HomeRoute(req, res) {
	res.render('root');
}

// route for: /faculty/:fac_key
// when the request is made, it takes fac_key and checks it against the database 
// if it passes the check, it displays the table
async function FacultyDashBoard(req, res) {
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
		const studentInfoRows = await dbUtils.GetTable(Tables.PERSONS);

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
}

// TODO: change the edit screen to a single form that sends json
// to the back end and then make fewer DB calls

// route for /faculty/edit/:studetn_key
async function EditStudent(req, res) {

}

module.exports = {
	FacultyDashBoard,
	EditStudent,
}
