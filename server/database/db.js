
const { Pool } = require('pg');
const logger = require('../utils/Logger');

class Database {
    constructor(pool) {
        this.pool = new Pool({
            host: process.env.PG_HOST,
            database: process.env.PG_DB,
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            port: 5432
        });
        this.retries = 5;
        this.retryTimeout = 5000; // How many ms to wait to retry
        this.pool.on('error', (err) => {throw err});
    }
    
    async connect() {
        while(this.retries > 0) {
            --this.retries
            try {
                await this.pool.connect();


                return logger.log('Connected to database', '[DATABASE]');
            } catch(err) {
                if(this.retries == 0) throw err;
                logger.error(err);
                await new Promise((res) => setTimeout(res, this.retryTimeout))
            }
        
        }
    }


    /**
     * 
     * @returns { Pool } pool
     */
    getPool() {
        return this.pool;
    }
    close() {
        this.connection.end();
    }
}

module.exports = new Database();