let db = require('mongoose');

let url = "mongodb://localhost:27017/test";

db.connect(url, (err,db) => {
    if (err) {
        console.log('Error with connect to database ');
        process.exit(1);
    } 
    console.log('Connected to database!');
});

module.exports = db;