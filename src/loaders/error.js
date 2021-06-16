const { isCelebrateError } = require('celebrate');
const Logger = require("./logger");
/**
 * handles all error generated from the app
 * @param {*} app the expressApp object
 */
module.exports = function (app) {
    /**
     * !catch 404 and forward to generic error handler
     */
    app.use((req, res, next) => {
        const err = new Error(`Requested API endpoint ${req.originalUrl} Not Found`);
        err['status'] = 404;
        next(err);
    });

    /**
     * !Generic error handler that logs and Sends the final error response
     */
    app.use((err, req, res, next) => {

        /**
         * !Handle validation error thrown by celebrate
         */
        if (isCelebrateError(err)) {
            let message = err.details.get("body").message;
            while(message.includes("\"")) { message = message.replace("\"","") }
            err.status = 400
            err.message = message;
        }

        Logger.error('🔥 error: %o', err);
        res.status(err.status || 500);
        res.json({ 
            statusCode: err.status || 500,
            errors: {
                message: err.message,
            },
        });
    });
}