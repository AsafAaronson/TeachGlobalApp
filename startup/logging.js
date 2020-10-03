const winston = require('winston');
require('winston-mongodb');
const config = require('config');
const dbPath = config.get('dbPath');
const logFilePath = config.get('logFilePath');

module.exports = function () {
    
    winston.add(winston.transports.File, {
        filename: logFilePath,
        level: 'error',
    });
    winston.add(winston.transports.MongoDB, {
        db: dbPath,
        level: 'info',
    });

    winston.handleExceptions([
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: logFilePath }),
        new winston.transports.MongoDB({ db: dbPath }),
    ]);

    process.on('unhandledRejection', (ex) => {
        throw ex;
    });
};
