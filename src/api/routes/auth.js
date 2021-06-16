//node module imports
const { celebrate, Joi } = require('celebrate');
const express = require('express');

//internal imports
const AuthService = require('../../services/AuthService');
const { isAuth } = require('../middlewares');
const Logger = require('../../loaders/logger');

const route = express.Router();

module.exports = function (app) {
    app.use('/auth', route);

    route.post(
        '/signup',
        celebrate({
            body: Joi.object({
                name: Joi.string().min(5).max(255).required(),
                email: Joi.string().min(5).max(255).email().required(),
                password: Joi.string().min(5).max(255).required(),
            }),
        }),
        async (req, res, next) => {
            Logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
            try {
                const { user, token } = await AuthService.SignUp(req.body);
                return res.status(201).json({ statusCode: 201, message: "registration successfull", data: { user, token } });
            } catch (e) {
                Logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );

    route.post(
        '/login',
        celebrate({
            body: Joi.object({
                email: Joi.string().required(),
                password: Joi.string().required(),
            }),
        }),
        async (req, res, next) => {
            Logger.debug('Calling Sign-In endpoint with body: %o', req.body);
            try {
                const { email, password } = req.body;
                const { user, token } = await AuthService.SignIn(email, password);
                return res.json({ statusCode: 200, message: "authentication successfull", data: { user, token } }).status(200);
            } catch (e) {
                Logger.error('🔥 error: %o', e);
                return next(e);
            }
        },
    );

    route.post(
        '/forgot-password',
        celebrate({
            params: Joi.object({
                email: Joi.string().required()
            }),
        }),
        async (req, res, next) => {
            Logger.debug('Requested to reset password: %o', req.body.email);
            try {
                let result = await AuthService.requestPasswordReset(req.body.email)
                return result;
            } catch (e) {
                logger.error('🔥 error %o', e);
                return next(e);
            }
        }
    );

    route.post(
        '/reset-password',
        celebrate({
            body: Joi.object({
                token: Joi.string().required(),
                newPassword: Joi.string().min(5).max(255).required(),
            }),
        }),
        async (req, res, next) => {
            let { token, newPassword } = req.body;
            Logger.debug('Requested to reset password: %o', req.body.email);
            try {
                let result = await AuthService.changeUserPassword(token, newPassword)
                return result;
            } catch (e) {
                logger.error('🔥 error %o', e);
                return next(e);
            }
        }
    );
}


