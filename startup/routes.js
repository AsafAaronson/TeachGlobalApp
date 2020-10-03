const express = require('express');
const fs = require('fs');
const error = require('../middlware/error');
const routesPath =
    'C:/Users/Oren/OneDrive/ASAF/Coding/Web/Node JS/TeachGlobalApp/routes';

const files = fs.readdirSync(routesPath, (err, files) => {
    if (err) {
        throw err;
    }
    return files;
});

module.exports = function (app) {
    app.use(express.json());

    files.forEach((file) => {
        app.use(`/api/${file}`, require(`${routesPath}/${file}`));
    });

    app.use(error);
};
