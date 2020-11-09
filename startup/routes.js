const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const config = require('config');
const error = require('../middlware/error');

const routesPath = './routes';

let files = fs.readdirSync(routesPath, (err, files) => {
    if (err) {
        throw err;
    }
    return files;
});
files = files.map((el) => el.slice(0, el.length - 3));

module.exports = function (app) {
    app.use(express.json());
    app.use(cookieParser());
    app.use(
        cors({
            origin: config.get('frontendOrigin'),
            credentials: true,
        })
    );

    files.forEach((file) => {
        app.use(`/api/${file}`, require(`.${routesPath}/${file}`));
    });

    app.use(error);
};
