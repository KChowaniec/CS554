var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
//middleware function to determine if user is authenticated

module.exports = function isAuthorized(req, res, next) {
    // check header parameters for token
    var token = req.session.token;
    // decode token
    if (token) {
        // verifies secret
        jwt.verify(token, 'secretkey', function (err, decoded) {
            if (err) {
                return res.status(400).end();
            } else {
                //make sure token exists in session
                if (req.session && req.session.token === token) {
                    return next();
                }
                else {
                    return res.status(400).end();
                }
            }
        });
    }
    // } else {
    //     // if there is no token
    //     return res.status(400).end();
    // }
};