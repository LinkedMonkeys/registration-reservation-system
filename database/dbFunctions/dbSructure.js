const Tables = {
  PERSONS: "Persons",
  REGISTRATION: "RegistrationList",
};

const Columns = {
  PERSONS: {
    UNIQUE_KEY: "Unique_Key",
    FIRST_NAME: "First_Name",
    LAST_NAME: "Last_Name",
    GROUP: "Group",
    EMAIL: "Email",
    ADVISOR: "Advisor",
  },
  REGISTRATION: {
    PROFESSOR_ID: "Professor_ID",
    STUDENT_ID: "Student_ID",
    DATE_AVAILABLE: "Date_Available",
    TIME: "Time",
    GROUP: "Group",
  },
}


module.exports = {
	Tables,
	Columns,
};
