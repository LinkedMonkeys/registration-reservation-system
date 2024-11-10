# capstone-registration-system-repo
This repository will be the collective work of the senior computer science developers from Ouachita Baptist University. The objective of this project is to produce a new registration platform for signup meetings between professor and student, as opposed to paper documentation.

# Environment Setup

After cloning the repo, there are some prerequisites that must be installed.
1. Install [node.js](https://nodejs.org/en/download/package-manager).
2. Install [SQLite](https://www.sqlite.org/download.html)
3. Install several node package dependencies
    * [sqlite3](https://www.npmjs.com/package/sqlite3) -- `npm install sqlite3`
    * [express](https://expressjs.com/en/starter/installing.html) -- `npm install express`
    * [ejs](https://ejs.co/) -- `npm install ejs`

# To run

To run, from the root of the project, run `node frontend/db.js`.  It will start
the node webserver on port 3000, by default.  At this point, a browser should be
able to connect with [http://localhost:3000/](http://localhost:3000/).