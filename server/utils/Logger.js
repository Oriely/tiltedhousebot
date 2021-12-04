const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class Logger {
    constructor(logPath) {

    }

    currentTime() {
        return new Date().toLocaleString();
    }
    
    error(error) {
        return console.error(`${chalk.red('[ERROR]')}[${this.currentTime()}]: ${error}`);
    }
    warn(warning) {
        return console.warn(`${chalk.yellow('[WARN]')}[${this.currentTime()}]: ${warning}`);
    }
    log(text) {
        return console.log(`${chalk.white('[LOG]')}[${this.currentTime()}]: ${text}`);
    }
    info(info) {
        return console.info(`${chalk.white('[INFO]')}[${this.currentTime()}]: ${info}`);
    }
    
}

module.exports = new Logger;