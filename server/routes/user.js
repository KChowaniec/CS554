/*Program Title: routes/user.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles all user-related routes
*/

var express = require('express');
var data = require("data");
var users = data.users;
var movie = data.movie;
var playlist = data.playlist;
var api = data.api;
var router = express.Router();
var xss = require('xss');
var passport = require('passport');
const uuid = require("node-uuid");
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens


router.get('/user/authorized', function (req, res) {
    // check header parameters for token
    var token = req.session.token;
    console.log(token);
    // decode token
    if (token) {
        // verifies secret
        jwt.verify(token, 'secretkey', function (err, decoded) {
            if (err) {
                return res.json({ authorized: false });
            } else {
                //make sure token exists in session
                if (req.session) {
                    return res.json({ authorized: true });
                }
                else {
                    return res.json({ authorized: false });
                }
            }
        });

    } else {
        // if there is no token
        return res.json({ authorized: false });
    }
});

//get all users
router.get('/users', function (req, res) {
    var redisConnection = req
        .app
        .get("redis");

    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;

    redisConnection.on(`users-retrieved:${messageId}`, (retrievedUsers, channel) => {
        redisConnection.off(`users-retrieved:${messageId}`);
        redisConnection.off(`users-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

        return res.json({ success: true, users: retrievedusers });
    });

    redisConnection.on(`users-retrieved-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`users-retrieved:${messageId}`);
        redisConnection.off(`users-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`users-retrieved:${messageId}`);
        redisConnection.off(`users-retrieved-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`get-users:${messageId}`, {
        requestId: messageId
    });
});

//LOG OUT
router.get('/logout', function (req, res) {
    var userId = req.session.userId;
    var sessionData = req.session;
    var redisConnection = req
        .app
        .get("redis");
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;


    redisConnection.on(`logged-out:${messageId}`, (deletedUser, channel) => {
        redisConnection.off(`logged-out:${messageId}`);
        redisConnection.off(`logout-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        if (deletedUser) {
            req.session.destroy();
            return res.json({ success: true });
        }
    });

    redisConnection.on(`logout-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`logged-out:${messageId}`);
        redisConnection.off(`logout-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`logged-out:${messageId}`);
        redisConnection.off(`logout-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`logout-user:${messageId}`, {
        requestId: messageId,
        userId: userId,
        session: sessionData
    });
});

//post user registration
router.post('/user/register', function (req, res) {
    var username = xss(req.body.username);
    var password = xss(req.body.password);
    var confirmedPassword = xss(req.body.confirm);
    var name = xss(req.body.name);
    var email = xss(req.body.email);
    var redisConnection = req
        .app
        .get("redis");

    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;

    redisConnection.on(`user-registered:${messageId}`, (registeredUser, channel) => {

        redisConnection.off(`user-registered:${messageId}`);
        redisConnection.off(`user-registered-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        if (registeredUser) {
            req.session.userId = registeredUser._id;
            req.session.name = registeredUser.name;
            req.session.token = jwt.sign(registeredUser, 'secretkey');
            return res.json({ success: true, token: req.session.token });
        }
    });

    redisConnection.on(`user-registered-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`user-registered:${messageId}`);
        redisConnection.off(`user-registered-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false,
            errors: error
        });

    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`user-registered:${messageId}`);
        redisConnection.off(`user-registered-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`register-user:${messageId}`, {
        requestId: messageId,
        username: username,
        password: password,
        confirmedPassword: confirmedPassword,
        name: name,
        email: email
    });

});

//get user information
router.get('/user', function (req, res) {

    let redisConnection = req
        .app
        .get("redis");
    let userId = req.session.userId;
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;

    redisConnection.on(`user-retrieved:${messageId}`, (retrievedUser, channel) => {

        redisConnection.off(`user-retrieved:${messageId}`);
        redisConnection.off(`user-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        if (retrievedUser) {
            return res.json({ success: true, user: JSON.stringify(retrievedUser) });
        }
    });

    redisConnection.on(`user-retrieved-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`user-retrieved:${messageId}`);
        redisConnection.off(`user-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`user-retrieved:${messageId}`);
        redisConnection.off(`user-retrieved-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`get-user:${messageId}`, {
        requestId: messageId,
        userId: userId
    });
});



//update user
router.put('/user', function (req, res) {
    let userId = req.session.userId;
    let newData = xss(req.body);
    console.log(newData);
    let redisConnection = req
        .app
        .get("redis");

    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;


    redisConnection.on(`user-updated:${messageId}`, (updatedUser, channel) => {
        redisConnection.off(`user-updated:${messageId}`);
        redisConnection.off(`user-updated-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        if (updatedUser) {
            console.log(updatedUser);
            return res.json({ success: true, user: updatedUser });
        }
    });

    redisConnection.on(`user-updated-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`user-updated:${messageId}`);
        redisConnection.off(`user-updated-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`user-updated:${messageId}`);
        redisConnection.off(`user-updated-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`update-user:${messageId}`, {
        requestId: messageId,
        update: newData,
        userId: userId
    });
});


//post user login - authenticate using passport local strategy
router.post('/user/login', function (req, res, next) {
    return passport.authenticate('local', (err, user) => {
        if (err || !user) {
            return res.json({
                success: false,
                message: err
            });
        }
        else {
            var redisConnection = req
                .app
                .get("redis");
            var messageId = uuid.v4();
            var killswitchTimeoutId = undefined;
            //add data to session object
            req.session.token = user.token;
            req.session.userId = user._id;
            req.session.name = user.profile.name;
            var sessionData = req.session;
            redisConnection.on(`logged-in:${messageId}`, (sessionData, channel) => {
                redisConnection.off(`logged-in:${messageId}`);
                redisConnection.off(`login-failed:${messageId}`);

                clearTimeout(killswitchTimeoutId);
                if (sessionData) {
                    return res.json({ success: true, token: sessionData.token });
                }
            });

            redisConnection.on(`login-failed:${messageId}`, (error, channel) => {
                redisConnection.off(`logged-in:${messageId}`);
                redisConnection.off(`login-failed:${messageId}`);

                clearTimeout(killswitchTimeoutId);
                return res.json({
                    success: false,
                    message: error,
                    errors: error
                });
            });

            killswitchTimeoutId = setTimeout(() => {
                redisConnection.off(`logged-in:${messageId}`);
                redisConnection.off(`login-failed:${messageId}`);
                return res
                    .status(500)
                    .json({ error: "Timeout error" })
            }, 5000);

            redisConnection.emit(`login-user:${messageId}`, {
                requestId: messageId,
                session: sessionData
            });
        }
    })(req, res, next);
});

router.post("/user/preferences", (req, res) => {
    let userId = req.session.userId;
    let preferences = xss(req.body);
    let redisConnection = req
        .app
        .get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;


    redisConnection.on(`preferences-saved:${messageId}`, (user, channel) => {
        redisConnection.off(`preferences-saved:${messageId}`);
        redisConnection.off(`preferences-saved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

        if (user) {
            return res.json({ success: true, user: user });
        }
    });

    redisConnection.on(`preferences-saved-failed:${messageId}`, (error, channel) => {

        redisConnection.off(`preferences-saved:${messageId}`);
        redisConnection.off(`preferences-saved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`preferences-saved:${messageId}`);
        redisConnection.off(`preferences-saved-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`save-preferences:${messageId}`, {
        requestId: messageId,
        userId: userId,
        preferences: preferences
    });
});

module.exports = router;

