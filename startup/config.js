const config = require('config');

module.exports = function () {
    if (!config.get("jwtPrivateKey")) {
        throw new Error("Fatal Error: jwtPrivateKey is not defined (configuration)");
    }
    if (!config.get("dbPath")) {
        throw new Error("Fatal Error: dbPath is not defined (configuration)");
    }
    if (!config.get("logFilePath")) {
        throw new Error("Fatal Error: logFilePath is not defined (configuration)");
    }
}