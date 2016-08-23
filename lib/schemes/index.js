"use strict";

const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize");
const _         = require('lodash');
const env       = process.env.NODE_ENV || "development";
const config    = require('../../config/config.json')[env];
const sequelize = new Sequelize(config.database, config.username, config.password, config);
const db        = {};

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file));
        if (model.name === 'githubRepository') {
            db['GitHubRepository'] = model;
        } else if (model.name === 'githubTask') {
            db['GitHubTask'] = model;
        } else {
            db[_.upperFirst(model.name)] = model;
        }
    });

Object.keys(db).forEach(modelName => {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;