function validateStudentEmail (email) {
	const validation_key = /^[a-z]{3}\d{5}@obu\.edu$/;
	return validation_key.test(email);
}

function validateProfessorEmail (email) {
	const validation_key = /@obu\.edu$/;
	return validation_key.test(email);
}

module.exports = {
	validateStudentEmail,
	validateProfessorEmail
}
