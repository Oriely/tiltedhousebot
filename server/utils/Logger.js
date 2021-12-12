const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class Logger {
    constructor(logPath) {

    }

    currentTime() {
        return new Date().toLocaleString();
    }
    
    error(error, from) {
        from = from || '';
        return console.error(`${chalk.red('[ERROR]')}${from}[${this.currentTime()}]: ${error}`);
    }
    warn(warning, from) {
        from = from || '';
        return console.warn(`${chalk.yellow('[WARN]')}${from}[${this.currentTime()}]: ${warning}`);
    }
    log(text,from) {
        from = from || '';
        return console.log(`${chalk.white('[LOG]')}${from}[${this.currentTime()}]: ${text}`);
    }
    info(info, from) {
        from = from || '';
        return console.info(`${chalk.white('[INFO]')}${from}[${this.currentTime()}]: ${info}`);
    }
    
}

module.exports = new Logger;