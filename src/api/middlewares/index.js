//node module imports
const jwt = require('express-jwt');

//internal imports
const config = require('../../config');
const Logger = require('../../loaders/logger');
const { User } = require('../../models/user');

/**
 * * Attach the details of authenticated user to the request
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const attachCurrentUser = async (req, res, next) => {
    try {
        const userRecord = await User.findById(req.token._id, ("-password"));
        if (!userRecord) {
            return res.sendStatus(401);
        }
        const currentUser = userRecord.toObject();
        Reflect.deleteProperty(currentUser, 'salt');
        req.currentUser = currentUser;
        return next();
    } catch (e) {
        Logger.error('🔥 Error attaching user to req: %o', e);
        return next(e);
    }
};


/**
 * * Get the JWT from the request header in the form of Authorization: Bearer ${JWT}
 * @param {*} req the request object
 * @returns {*} the token
 */
const getTokenFromHeader = (req) => {
    if (
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};

/**
 * * for setting and getting the authentication token on and from the request header using jwt request handler
 */
const isAuth = jwt({
    secret: config.jwtSecret, // The _secret_ to sign the JWTs
    algorithms: config.jwtAlgorithm, // JWT Algorithm
    userProperty: 'token', // Use req.token to store the JWT
    getToken: getTokenFromHeader, // How to extract the JWT = require(the request
});


module.exports = { attachCurrentUser, getTokenFromHeader, isAuth }