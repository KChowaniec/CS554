var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var auth = require('../public/js/utils/auth.js');
//middleware function to determine if user is authenticated

module.exports = function isAuthorized(req, res, next) {
    // check header parameters for token
    var token = req.session.token;
    console.log(token);
    // decode token
    if (token) {
        // verifies secret
        console.log(req.session);
        jwt.verify(token, 'secretkey', function (err, decoded) {
            if (err) {
                  auth.unsetLogin();
            } else {
                //make sure token exists in session
                if (req.session) {
                      auth.setLogin();
                    //return next();
                }
                else {
                    // return res.status(400).end();
                      auth.unsetLogin();
                }
            }
        });
    }
    else {
        auth.unsetLogin();
    }
    return next();
};