// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Set up for .ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));  
app.use(express.urlencoded({ extended: true }));

// Route imports
const facultyRoutes = require('./routes/faculty');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');

// Route usage
app.use('/faculty_main', facultyRoutes);
app.use('/student_main', studentRoutes);
app.use('/admin', adminRoutes);

// Simple logger
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Default route
app.get('/', (req, res) => {
  res.send('Server running. Try /faculty_main/:fac_key or /student_main/:student_key');
});

// Start the server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
