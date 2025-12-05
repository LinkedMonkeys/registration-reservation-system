const sqlite3 = require('sqlite3').verbose();
const dbPath = './database/Production/registration-sample-DB-Production.db';
const {Table, Columns, Tables} = require('./dbSructure')
 const Db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Tables names

// Gets all colmuns of a specified table 
function GetTable(tblName) {
	const rows = `SELECT *
			      FROM ${tblName};`

	return new Promise((resolve, reject) => {
		Db.all(rows, [], (err, rows) => {
			if (err) reject(`Error with database query: ${err}`);
			else resolve(rows);
		});
	});
}

// Gets all items from a table with a specified where clause
function FilterGetTable(tblName, field, value) {
	const rows = `
		SELECT * 
		FROM ${tblName}
		WHERE ${field} = ?
`
	return new Promise((resolve, reject) => {
		Db.all(rows, [value], (err, rows) => {
			if (err) reject(`Error with DB query: ${err}`);
			else resolve(rows);
		});
	});
}

// Gets all columns from Persons with a specified key and group
function GetPersonByGroup(trgtKey, trgtGroup) {
	const rows = `SELECT *
				   FROM Persons p
				   WHERE p.Unique_key = ? AND p."Group" = ?`;

	return new Promise((resolve, reject) => {
		Db.all(rows, [trgtKey, trgtGroup], (err, rows) => {
			if (err) reject(`Error with DB Query: ${err}`)
			else resolve(rows)
		});
	});
} 

function GetPersonByID(id) {
	const rows = `SELECT * FROM Persons p WHERE p.Unique_Key = ?`;

	return new Promise((resolve, reject) =>
	{
		Db.all(rows, [id], (err, rows) => {
			if (err) reject(`Error with DB query: ${err}`)
			else resolve(rows);
		});
	});
}

// SELECT * FROM RegistrationList rl 
// JOIN PERSONS p ON rl.Student_ID 
// WHERE rl.Professor_ID = 'ABC123'
function GetTimesByProfesor(profID) {
	const rows = `SELECT * 
	 FROM RegistrationList rl 
	 JOIN PERSONS p ON rl.Student_ID = p.Unique_Key 
	 WHERE rl.Professor_ID = ?;`

	return new Promise((resolve, reject) => {
		Db.all(rows, [profID], (err, rows) =>{
			if (err) reject(`Error with DB Query: ${err}`)
			else resolve(rows)
		});
	});
};

function UpdateStudent(studentID, field, value) {
	const rows = `UPDATE ${Tables.PERSONS} SET ${field} = ? WHERE ${Columns.PERSONS.UNIQUE_KEY} = ?`

	return new Promise((resolve, reject) => {
		Db.all(rows, [value, studentID], (err, rows) => {
			if (err) reject(`Error with DB query: ${err}`)
			else resolve(rows);
		});
	});
}

module.exports = {
	GetTable,
	GetPersonByGroup,
	FilterGetTable,
	GetTimesByProfesor,
	GetPersonByID,
	UpdateStudent,
}
