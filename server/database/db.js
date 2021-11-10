
const { Pool } = require('pg');

const pool = new Pool({
	host: 'postgresql',
	database: 'tiltedbot',
	user: 'tiltedbot',
	password: 'postgres',
	port: 5432

});

class Database {
    constructor() {
        this.connection = null;
        this.retries = 5;
        this.retryTimeout = 5000; // How many ms to wait to retry
    }
    async tryconnect() {
        while(this.retries > 0) {
                try {
                    await pool.connect().then( (connection) => {
                        this.connection = connection;
                        this.retries = 5;
                        console.log('Connected to database');
                        return connection;
                    });
                    break;
                } catch (err) {
                        this.retries--;
                    if(this.retries === 0)  {
                        console.log(`Could not establish connection to database.`)
                        throw err;
                    }
                    console.log(err, `${this.retries} retries left. Trying again.`);
                    await new Promise(res => setTimeout(res, 2000));
                }
        }
    }

    getCon() {
        if(!connection) return
        return this.connection();
    }
    close() {
        this.connection.end();
    }
}

module.exports = new Database;