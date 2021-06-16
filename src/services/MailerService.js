//node modules imports
const nodemailer = require('nodemailer');

//internal imports
const config = require('../config');
const logger = require('../loaders/logger');

let auth = config.mailer;

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth
});


/**
 * * configures the transporter to use the parameters as the options for the email to be sent
 * @param {*} to the email address to send a mail to
 * @param {*} subject the subject of the email
 * @param {*} html the html content to be sent in the email
 * @returns 
 */
let mailOptions = (to, subject, html) => {
    return ({
        from: auth.user, // sender email address
        to, // list of receivers
        subject, // Subject line
        html// plain text body
    });
};


/**
 * * sends mail to specified email addresses using gmail SMTP
 * @param {*} email the email address to send a mail to
 * @param {*} subject the subject of the email
 * @param {*} html the html content to be sent in the email
 * @returns
 */
const sendMail = async (email, subject, html) => {
    transporter.sendMail(mailOptions(email, subject, html), function (err, info) {
        if (err) {
            logger.error(err)
            return ({
                statusCode: 400,
                message: `an error occurred, ${subject} email sending failed.`,
            });
        } else return ({
            statusCode: 200,
            message: `${subject} email successfully sent`
        });
    });
}

module.exports = { sendMail }