var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
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
                return res.redirect('/login');
            } else {
                //make sure token exists in session
                if (req.session && req.session.token === token) {
                    return next();
                }
                else {
                    // return res.status(400).end();
                    return res.redirect('/login');
                }
            }
        });
    }
    else {
        return res.redirect('/login');
    }

    // else {
    //     console.log("no token");
    //     res.redirect('/login');
    // }
};