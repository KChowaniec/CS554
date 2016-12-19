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
    // decode token
    if (token) {
        // verifies secret
        jwt.verify(token, 'secretkey', function (err, decoded) {
            if (err) {
                return res.json({ authorized: false });
            } else {
                //make sure token exists in session
                if (req.session && req.session.token === token) {
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
            req.session.name = registeredUser.profile.name;
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

    var redisConnection = req
        .app
        .get("redis");
    var userId = req.session.userId;
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;

    redisConnection.on(`user-retrieved:${messageId}`, (retrievedUser, channel) => {

        redisConnection.off(`user-retrieved:${messageId}`);
        redisConnection.off(`user-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        if (retrievedUser) {
            return res.json({ success: true, user: retrievedUser });
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
    var userId = req.session.userId;
    var newData = xss(req.body);
    var email = xss(req.body.email);
    var password = xss(req.body.password);
    var redisConnection = req
        .app
        .get("redis");

    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;


    redisConnection.on(`user-updated:${messageId}`, (updatedUser, channel) => {
        redisConnection.off(`user-updated:${messageId}`);
        redisConnection.off(`user-updated-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({ success: true, user: updatedUser });
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
        email: email,
        password: password,
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

// //get user's password
// router.get('/forgot/:username', function (req, res) {

//     let redisConnection = req
//         .app
//         .get("redis");
//     let username = req.params.username;
//     let messageId = uuid.v4();
//     let killswitchTimeoutId = undefined;

//     redisConnection.on(`user-retrieved:${messageId}`, (retrievedUser, channel) => {

//         redisConnection.off(`user-retrieved:${messageId}`);
//         redisConnection.off(`user-retrieved-failed:${messageId}`);

//         clearTimeout(killswitchTimeoutId);
//     });

//     redisConnection.on(`user-retrieved-failed:${messageId}`, (error, channel) => {
//         redisConnection.off(`user-retrieved:${messageId}`);
//         redisConnection.off(`user-retrieved-failed:${messageId}`);

//         clearTimeout(killswitchTimeoutId);
//         res.json(error);
//     });

//     killswitchTimeoutId = setTimeout(() => {
//         redisConnection.off(`user-retrieved:${messageId}`);
//         redisConnection.off(`user-retrieved-failed:${messageId}`);
//         res
//             .status(500)
//             .json({ error: "Timeout error" })
//     }, 5000);

//     redisConnection.emit(`get-user:${messageId}`, {
//         requestId: messageId,
//         userId: userId
//     });
// });


//post user update email
// router.post('/user/update_email', function (req, res) {
//     users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//         userObj.profile.email = req.body.email;
//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!", email: newUser.profile.email });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     }).catch((error) => {
//         res.json({ success: false, message: error });
//     });
// });

// //post user update password
// router.post('/user/update_password', function (req, res) {
//     var newPassword = req.body.newPassword;
//     var confirmPassword = req.body.confirmPassword;
//     if ((newPassword != confirmPassword) || newPassword == null || newPassword == undefined || newPassword == "") {
//         res.json({ success: false, message: "Please enter valid new password and confirm password!" });
//         return;
//     }

//     users.getUserBySessionIdAndPassword(req.cookies.next_movie, req.body.oldPassword).then((userObj) => {
//         var hash = crypto.createHash("sha1");
//         hash.update(newPassword);
//         var password = hash.digest("hex");

//         userObj.hashedPassword = password;
//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!" });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     }).catch((error) => {
//         res.json({ success: false, message: error });
//     });
// });

// //post user removes genre from preferences
// router.post('/user/delete_genre', function (req, res) {
//     var deleteVal = req.body.value;

//     users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//         var genreArr = userObj.preferences.Genre;
//         var newGenArr = [];
//         for (var i = 0; i < genreArr.length; i++) {
//             if (genreArr[i] != deleteVal) {
//                 newGenArr.push(genreArr[i]);
//             }
//         }

//         userObj.preferences.Genre = newGenArr;
//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!" });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     }).catch((error) => {
//         res.json({ success: false, message: error });
//     });
// });

// //post user adds genre to preferences
// router.post('/user/add_genre', function (req, res) {
//     var addVal = req.body.value;

//     movie.getAllGenre().then((genreList) => {
//         var flag = true;
//         for (var i = 0; i < genreList.length; i++) {
//             if (addVal == genreList[i]) {
//                 flag = false;
//                 break;
//             }
//         }

//         if (flag) {
//             res.json({ success: false, message: "This genre value is not valid!" });
//             return;
//         }

//         users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//             var genreArr = userObj.preferences.Genre;
//             var flag = true;
//             for (var i = 0; i < genreArr.length; i++) {
//                 if (genreArr[i] == addVal) {
//                     flag = false;
//                     break;
//                 }
//             }

//             if (!flag) {
//                 res.json({ success: false, message: "This genre value has been added!" });
//                 return;
//             }

//             genreArr.push(addVal);
//             userObj.preferences.Genre = genreArr;
//             users.updateUserById(userObj._id, userObj).then((newUser) => {
//                 if (newUser) {
//                     res.json({ success: true, message: "Update success!" });
//                 }
//             }).catch((error) => {
//                 res.json({ success: false, message: error });
//             });
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     });
// });

// //post user removes age rating from preferences
// router.post('/user/delete_ageRating', function (req, res) {
//     var deleteVal = req.body.value;

//     users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//         var ageArr = userObj.preferences.ageRating;
//         var newAgeArr = [];
//         for (var i = 0; i < ageArr.length; i++) {
//             if (ageArr[i] != deleteVal) {
//                 newAgeArr.push(ageArr[i]);
//             }
//         }

//         userObj.preferences.ageRating = newAgeArr;
//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!" });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     }).catch((error) => {
//         res.json({ success: false, message: error });
//     });
// });

// //post user adds age rating to preferences
// router.post('/user/add_ageRating', function (req, res) {
//     var addVal = req.body.value;

//     movie.getAllAgeRating().then((ageRatingList) => {
//         var flag = true;
//         for (var i = 0; i < ageRatingList.length; i++) {
//             if (addVal == ageRatingList[i]) {
//                 flag = false;
//                 break;
//             }
//         }

//         if (flag) {
//             res.json({ success: false, message: "This age rating value is not valid!" });
//             return;
//         }

//         users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//             var ageArr = userObj.preferences.ageRating;
//             var flag = true;
//             for (var i = 0; i < ageArr.length; i++) {
//                 if (ageArr[i] == addVal) {
//                     flag = false;
//                     break;
//                 }
//             }

//             if (!flag) {
//                 res.json({ success: false, message: "This age rating value has been added!" });
//                 return;
//             }

//             ageArr.push(addVal);
//             userObj.preferences.ageRating = ageArr;
//             users.updateUserById(userObj._id, userObj).then((newUser) => {
//                 if (newUser) {
//                     res.json({ success: true, message: "Update success!" });
//                 }
//             }).catch((error) => {
//                 res.json({ success: false, message: error });
//             });
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     });
// });

// //post user removes keywords from preferences
// router.post('/user/delete_keywords', function (req, res) {
//     var deleteVal = req.body.value;

//     users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//         var keywordArr = userObj.preferences.keywords;
//         var newKeywordArr = [];
//         var flag = true;
//         for (var i = 0; i < keywordArr.length; i++) {
//             if (keywordArr[i] == deleteVal) {
//                 flag = false;
//             } else {
//                 newKeywordArr.push(keywordArr[i]);
//             }
//         }
//         if (flag) {
//             res.json({ success: false, message: "This keyword value has not been added!" });
//             return;
//         }

//         userObj.preferences.keywords = newKeywordArr;
//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!" });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     });
// });

// //post user adds keywords to preferences
// router.post('/user/add_keywords', function (req, res) {
//     var addVal = req.body.value;

//     api.getKeywordIdByName(addVal).then((keyword) => {
//         if (keyword) {
//             users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//                 var keywordArr = userObj.preferences.keywords;
//                 var flag = true;
//                 for (var i = 0; i < keywordArr.length; i++) {
//                     if (keywordArr[i] == addVal) {
//                         flag = false;
//                         break;
//                     }
//                 }
//                 if (!flag) {
//                     res.json({ success: false, message: "This keyword value has been added!" });
//                     return;
//                 }

//                 keywordArr.push(addVal);
//                 users.updateUserById(userObj._id, userObj).then((newUser) => {
//                     if (newUser) {
//                         res.json({ success: true, message: "Update success!" });
//                     }
//                 }).catch((error) => {
//                     res.json({ success: false, message: error });
//                 });
//             });
//         } else {
//             res.json({ success: false, message: "Keyword not found!" });
//         }
//     }).catch((error) => {
//         res.json({ success: false, message: error });
//     });
// });

// //post user adds year to preferences
// router.post('/user/add_releaseYear', function (req, res) {
//     var year = req.body.year;
//     var now = new Date();

//     if (year < 1900 || year > now.getFullYear) {
//         res.json({ success: false, message: "Year is not valid!" });
//         return;
//     }

//     users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//         var releaseYear = userObj.preferences.releaseYear;
//         var newReleaseYear = [];
//         var flag = true;
//         for (var i = 0; i < releaseYear.length; i++) {
//             if (releaseYear[i] == year) {
//                 flag = false;
//             } else {
//                 newReleaseYear.push(releaseYear[i]);
//             }
//         }

//         if (!flag) {
//             res.json({ success: false, message: "The year has been added!" });
//             return;
//         }

//         newReleaseYear.push(year);
//         userObj.preferences.releaseYear = newReleaseYear;
//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!" });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     });
// });

// //post user removes year from preferences
// router.post('/user/delete_releaseYear', function (req, res) {
//     var year = req.body.value;
//     users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//         var releaseYear = userObj.preferences.releaseYear;
//         var newReleaseYear = [];
//         var flag = true;
//         for (var i = 0; i < releaseYear.length; i++) {
//             if (releaseYear[i] == year) {
//                 flag = false;
//             } else {
//                 newReleaseYear.push(releaseYear[i]);
//             }
//         }

//         if (flag) {
//             res.json({ success: false, message: "You did not add this year!" });
//             return;
//         }

//         userObj.preferences.releaseYear = newReleaseYear;
//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!" });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     });
// });

// //post user adds person to preferences
// router.post('/user/add_person', function (req, res) {
//     var addVal = req.body.value;

//     api.getCreditByPersonId(addVal).then((person) => {
//         if (person.id == null || person.id == undefined) {
//             res.json({ success: false, message: "Person doesn't exist!" });
//             return;
//         }

//         addVal = person.name;
//         users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//             var actorArr = userObj.preferences.Actor;
//             var newActorArr = [];
//             var crewArr = userObj.preferences.Crew;
//             var newCrewArr = [];
//             var flag = true;
//             var mark = "";

//             //if person has both cast and crew credits, mark as actor if cast credits are more than crew credits
//             if (person.movie_credits.cast.length > 0 && person.movie_credits.cast.length > person.movie_credits.crew.length) {
//                 mark = "actor";
//                 for (var i = 0; i < actorArr.length; i++) {
//                     if (actorArr[i] == addVal) {
//                         flag = false;
//                     } else {
//                         newActorArr.push(actorArr[i]);
//                     }
//                 }
//                 if (!flag) {
//                     res.json({ success: false, message: "The actor has been added!" });
//                     return;
//                 }

//                 newActorArr.push(addVal);
//                 userObj.preferences.Actor = newActorArr;
//             } else if (person.movie_credits.crew.length > 0) { //mark as crew
//                 flag = true;
//                 mark = "crew";
//                 for (var i = 0; i < crewArr.length; i++) {
//                     if (crewArr[i] == addVal) {
//                         flag = false;
//                     } else {
//                         newCrewArr.push(crewArr[i]);
//                     }
//                 }
//                 if (!flag) {
//                     res.json({ success: false, message: "The crew has been added!" });
//                     return;
//                 }

//                 newCrewArr.push(addVal);
//                 userObj.preferences.Crew = newCrewArr;
//             } else {
//                 res.json({ success: false, message: "The person is not Actor or Crew!" });
//                 return;
//             }

//             users.updateUserById(userObj._id, userObj).then((newUser) => {
//                 if (newUser) {
//                     res.json({ success: true, mark: mark, name: addVal, message: "Update success!" });
//                 }
//             }).catch((error) => {
//                 res.json({ success: false, message: error });
//             });
//         });
//     });
// });

// //post user removes actor from preferences
// router.post('/user/delete_actor', function (req, res) {
//     var actor = req.body.value;
//     users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//         var actorArr = userObj.preferences.Actor;
//         var newActorArr = [];
//         var flag = true;
//         for (var i = 0; i < actorArr.length; i++) {
//             if (actorArr[i] == actor) {
//                 flag = false;
//             } else {
//                 newActorArr.push(actorArr[i]);
//             }
//         }
//         if (flag) {
//             res.json({ success: false, message: "You did not add this actor!" });
//             return;
//         }

//         userObj.preferences.Actor = newActorArr;
//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!" });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     });
// });

// //post user removes crew from preferences
// router.post('/user/delete_crew', function (req, res) {
//     var crew = req.body.value;
//     users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//         var crewArr = userObj.preferences.Crew;
//         var newCrewArr = [];
//         var flag = true;
//         for (var i = 0; i < crewArr.length; i++) {
//             if (crewArr[i] == crew) {
//                 flag = false;
//             } else {
//                 newCrewArr.push(crewArr[i]);
//             }
//         }
//         if (flag) {
//             res.json({ success: false, message: "You did not add this crew!" });
//             return;
//         }

//         userObj.preferences.Crew = newCrewArr;
//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!" });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     });
// });

// //post user clears all preferences
// router.post('/user/clear_preferences', function (req, res) {
//     users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
//         userObj.preferences.Actor = [];
//         userObj.preferences.Genre = [];
//         userObj.preferences.Crew = [];
//         userObj.preferences.releaseYear = [];
//         userObj.preferences.ageRating = [];
//         userObj.preferences.keywords = [];

//         users.updateUserById(userObj._id, userObj).then((newUser) => {
//             if (newUser) {
//                 res.json({ success: true, message: "Update success!" });
//             }
//         }).catch((error) => {
//             res.json({ success: false, message: error });
//         });
//     });
// });

module.exports = router;

