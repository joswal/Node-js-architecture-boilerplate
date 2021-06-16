//node module imports
const { celebrate, Joi } = require('celebrate');
const express = require('express');

//internal imports
const AuthService = require('../../services/AuthService');
const { isAuth, attachCurrentUser } = require('../middlewares');
const Logger = require('../../loaders/logger');

const route = express.Router();

module.exports = function (app) {
    app.use('/user', route);

    route.get('/me', isAuth, attachCurrentUser, (req, res) => {
        return res.json({
            statusCode: 200, 
            message: "user details gotten successfully", 
            data: {user: req.currentUser} 
        }).status(200);
    });

}


