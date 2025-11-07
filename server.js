const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', './Views');
app.use(express.urlencoded({ extended: true}));

const routes = require('./Functions/routes/routes.js')

// faculty dashboard for editing students and seeing timeslots
app.get('/faculty/:fac_key', routes.FacultyDashBoard);


app.get('/faculty/edit/:student_key', routes.EditStudent);

app.listen(port, () => {
	console.log(`website running at http://localhost:${port}/`)
})
