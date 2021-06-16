const auth = require("./routes/auth");
const user = require("./routes/user");
const Router = require('express').Router();


module.exports = function () {
    auth(Router);
    user(Router);

    return Router;
}
