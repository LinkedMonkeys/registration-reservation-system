const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', './Views');

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

const facultyRoutes = require('./Functions/routes/facultyRoutes.js');

app.use('/faculty', facultyRoutes)

app.listen(port, () => {
	console.log(`website running at http://localhost:${port}/`)
})
