//node modules imports
const jwt = require('jsonwebtoken');
const uuidv1 = require('uuid');
const argon2 = require('argon2');
const { randomBytes } = require('crypto');

//internal imports
const MailerService = require('./MailerService');
const config = require('../config');
const logger = require('../loaders/logger');
const { User } = require('../models/user');
const { Token } = require("../models/token");

/**
 * * Create a new user record then return the user details and authentication token
 * @param {*} userInputDTO the user registration payload which contains the name, email and password
 * @returns user object and token 
 */
const SignUp = async (userInputDTO) => {
    try {
        const salt = randomBytes(32);

        logger.silly('Hashing password');
        const hashedPassword = await argon2.hash(userInputDTO.password, { salt });

        logger.silly('Creating user db record');
        const userRecord = await User.create({
            ...userInputDTO,
            salt: salt.toString('hex'),
            password: hashedPassword,
        });

        if (!userRecord) {
            throw new Error('User cannot be created');
        }
        const { user, token } = processUserDetailsAndToken(userRecord);

        logger.silly('Sending welcome email');
        sendWelcomeEmail(user.email)

        return { user, token };
    } catch (e) {
        logger.error(e);
        throw e;
    }
}

/**
 * * authenticate a registered user and generate token for the user
 * @param {*} email user email
 * @param {*} password user password
 * @returns user object and token
 */
const SignIn = async (email, password) => {
    const userRecord = await User.findOne({ email });
    if (!userRecord) {
        throw new Error('User not registered');
    }
    /**
     * We use verify from argon2 to prevent 'timing based' attacks
     */
    logger.silly('Checking password');
    const validPassword = await argon2.verify(userRecord.password, password);
    if (validPassword) {
        logger.silly('Password is valid!');
        const { user, token } = processUserDetailsAndToken(userRecord);
        return { user, token };
    } else {
        throw new Error('Invalid Password');
    }
}

/**
 * * removes the password and salt values from the user record and also generates the authentication token
 * @param {*} userRecord the raw details of the user fetched from the db 
 * @returns the strimlined user payload and the aunthentication token generated 
 */
const processUserDetailsAndToken = (userRecord) => {
    logger.silly('Generating JWT');
    const token = generateToken(userRecord);
    const user = userRecord.toObject();
    Reflect.deleteProperty(user, 'salt');
    Reflect.deleteProperty(user, 'password');
    return { user, token };
}

/**
 * * generates an authentication token from the user details
 * @param {*} user the payload that contains the user details
 * @returns token
 */
const generateToken = (user) => {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    logger.silly(`Sign JWT for userId: ${user._id}`);
    return jwt.sign(
        {
            _id: user._id, // We are gonna use this in the middleware 'isAuth'
            role: user.role,
            name: user.name,
            exp: exp.getTime() / 1000,
        },
        config.jwtSecret
    );
}

/**
 * * sends a welcome email to the newly registered user
 * @param {*} email email of the user
 */
const sendWelcomeEmail = async (email) => {
    let html = `<p >Thanks for creating a new account on our platform<p/>`;
    await MailerService.sendMail(email, "Welcome", html);
}

/**
 * * sends a password reset token to user email
 * @param {*} email email of the user
 * @returns 
 */
const requestPasswordReset = async (email) => {
    try {
        let user = await User.findOne({ email });
        if (!user) throw new Error('user account not found');

        let token = uuidv1();
        let type = 'password';
        let { user_id } = user;
        let tokenObject = new Token({ user_id, token, type });
        tokenObject = await tokenObject.save();

        let html = `<p> your password reset token is ${tokenObject.token}<p/>`;

        console.log(html)

        let response = await MailerService.sendMail(email, "Password Reset", html);
        return response;
    } catch (error) {
        logger.error(error);
        throw (error)
    }
}

/**
 * set a new password on user account
 * @param {*} token the password reset token sent to user email
 * @param {*} newPassword the new password to be set
 * @returns 
 */
const changeUserPassword = async (token, newPassword) => {
    try {
        tokenData = await Token.findOne({ token });
        if (!tokenData || tokenData.type != 'password') return { statusCode: 401, message: 'Invalid token.' };
        if (!tokenData.active || Date.now() >= tokenData.expiry)
            return { statusCode: 401, message: 'token already used or expired, request for a new one.' }

        await Token.findOneAndUpdate({ _id: tokenData._id }, { active: false });

        let { user_id } = tokenData;
        let user = await User.findById(user_id)
        let { salt } = user

        logger.silly('Hashing password');
        const hashedPassword = await argon2.hash(newPassword, { salt });

        await User.findOneAndUpdate({ _id: user_id }, { password: hashedPassword })

        return { statusCode: 200, message: `password changed succesfully` }
    } catch (error) {
        logger.error(error);
        throw (error)
    }
}


module.exports = { SignUp, SignIn, requestPasswordReset, changeUserPassword }