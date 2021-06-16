const express = require('express');
const { dbLoader } = require('./db');
const config = require('../config');
const routes = require('../api');
const cors = require('cors')
const Logger = require("./logger");
const errorHandler = require("./error");

/**
 * * initialize all the components required to run the app
 * @param {* } app the ExpressApp object  
 */
const appLoader = async (app) => {
    // Load the DB connection
    let mongoConnection = await dbLoader();
    if(mongoConnection) Logger.info('✌️ DB loaded and connected!');
    
    // Load all the necessary middlewares for processing and parsing requests successfully
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cors());

    // Load API routes
    app.use(config.api.prefix, routes());

    //handle all errrors
    errorHandler(app);
}

module.exports = { appLoader }