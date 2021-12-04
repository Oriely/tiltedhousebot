
const { Pool } = require('pg');
const logger = require('../utils/Logger');
const dbPool = new Pool({
	host: process.env.PG_HOST,
	database: process.env.PG_DB,
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	port: 5432
});

class Database {

    constructor(pool) {
        this.pool = pool;
        this.connection = null;
        this.retries = 5;
        this.retryTimeout = 5000; // How many ms to wait to retry
        this.connected = false;

    }
    
    async connect() {
        if(this.connected) return;
        while(this.retries > 0) {
            --this.retries

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

module.exports = new Database(dbPool);