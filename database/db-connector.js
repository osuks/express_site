// ./database/db-connector.js

// Get an instance of mysql we can use in the app
var mysql = require('mysql')

// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs340_kerchnec',
    password        : '2171',
    database: 'cs340_kerchnec',
    multipleStatements: true
})

// Export it for use in our app
module.exports.pool = pool;
