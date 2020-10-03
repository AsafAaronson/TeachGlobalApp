const express = require('express');
const config = require('config');
const winston = require('winston');

const app = express();
require('./startup/routes')(app)

require('./startup/logging')();

require('./startup/config')();
//Connect to DB
require('./startup/db')();

app.listen(config.get('port'), () =>
    winston.info(`App Listening on port ${config.get('port')}`)
);


