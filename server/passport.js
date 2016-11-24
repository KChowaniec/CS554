const userCollection = require("../data");
userData = userCollection.users;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    // used to deserialize the usesr
    passport.deserializeUser(function (id, done) {
        process.nextTick(function () {
            userData.getUserById(id).then((user) => {
                done(null, user);
            }).catch((error) => {
                done(error);
            });
        });
    });

    //local authentication using username and password
    passport.use(new LocalStrategy({ passReqToCallback: true },
        function (req, username, password, done) {
            process.nextTick(function () {
                userData.getUserByUsername(username).then((user) => {
                    console.log(user);
                    if (!userData.verifyLogin(password, user.password)) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    var token = jwt.sign(user, 'secretkey');
                    user.token = token;
                    return done(null, user);
                }).catch((error) => {
                    return done(error);
                });
            });
        }
    ));

}