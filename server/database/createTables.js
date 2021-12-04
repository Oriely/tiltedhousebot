const fs = require('fs');
const { Pool } = require('pg');
const db = require('./db');

const client = new Pool({
    host: localhost,
	database: process.env.PG_DB,
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	port: 5432
});

(async() => {

    
    const structure = fs.readFileSync('./structure.sql');

    await db.tryconnect();

    db.connection.query('',() => {

    })


    await db.close();


})();