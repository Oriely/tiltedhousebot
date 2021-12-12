
const fs = require('fs');
const { Pool } = require('pg');
const db = require('./db');

(async() => {

    db.pool = new Pool({
        host: 'localhost',
        database: 'tiltedbot',
        user: 'tiltedbot',
        password: 'postgres',
        port: 5432
    });
    const sqlFile = fs.readFileSync('./structure.sql');
    
    const sql = sqlFile.toString();

    console.log(sql);
    await db.connect();

    db.pool.query(sql)
    .then((res) => {
        console.log(res)
    })
    .catch(console.log);
})();