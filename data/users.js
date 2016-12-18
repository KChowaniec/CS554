/*Program Title: data/users.js
Course: CS546-WS
Date: 08/18/2016
Description:
This module exports methods related to the user collection
*/

mongoCollections = require("./config/mongoCollections");
Users = mongoCollections.users;
ObjectId = require('mongodb').ObjectID;
var playlist = require('./playlist');
var uuid = require('node-uuid');
var bcrypt = require('bcryptjs');


var exportedMethods = {
    //get all users
    getAllUser() {
        return Users().then((userCollection) => {
            return userCollection.find({}).toArray();
        });
    },
    // get user by user id
    getUserById(id) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ _id: id }).then((userObj) => {
                if (!userObj) throw "Users not found";
                return userObj;
            }).catch((error) => {
                return "some error happened";
            });
        });
    },

    //get user's preferences
    getUserPreferences(userId) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ _id: userId }, { preferences: 1, _id: 0 }).then((userObj) => {
                if (!userObj) throw "User not found";
                return userObj;
            }).catch((error) => {
                return error;
            });
        });
    },

    saveUserPreferences(userId, preferences) {
        return Users().then((userCollection) => {
            return userCollection.update({ _id: userId }, { $set: preferences }).then(function () {
                return userId;
            }).then(id => {
                return this.getUserById(id);
            }).catch((error) => {
                return error;
            });
        });
    },
    //verify password is correct
    verifyLogin(password, hashedPwd) {
        if (!password) throw ("A password must be provided");
        if (!hashedPwd) throw ("A hashed password must be provided");
        if (bcrypt.compareSync(password, hashedPwd)) {
            return true;
        }
        else {
            return false;
        }
    },
    //get user by username
    getUserByUsername(username) {
        if (!username) { Promise.reject("A username must be provided") };
        return Users().then((userCollection) => {
            return userCollection.find({ "profile.username": username }).limit(1).toArray().then(function (listOfUsers) {
                //user could not be retrieved
                if (listOfUsers.length === 0) throw "Could not find user with username of " + username;
                return listOfUsers[0]; //else return user
            });
        });
    },

    //add general user object
    addUsersGeneral(obj) {
        return Users().then((userCollection) => {
            obj["_id"] = uuid.v4();
            obj["profile"]["_id"] = obj["_id"];
            return userCollection.insertOne(obj).then((userObj) => {
                return userObj.insertedId;
            }).then(newId => {
                return this.getUserById(newId);
            });
        });
    },

    //add user using speciifc parameters
    addUsers(username, password, profile, preferences) {
        var userid = uuid.v4();
        profile["_id"] = userid;
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(password, salt);
        var obj = {
            _id: userid,
            password: hashedPassword,
            profile: profile,
            preferences: preferences
        };
        return Users().then((userCollection) => {
            return userCollection.insertOne(obj).then((userObj) => {
                return userObj.insertedId;
            }).then(newId => {
                return this.getUserById(newId);
            });
        });
    },


    //This is a cascading method which can create user and the user's playlist
    //please note that: the title is the title for playlist and the userObj contains:sessionId,hashedPassword,profile,preferences
    //the profile attribute doesn't contain the _id and the _id will be created by this function
    addUsersAndPlaylist(title, userObj) {
        var userId = uuid.v4();
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(userObj.password, salt);
        var obj = {
            _id: userId,
            password: hashedPassword,
            profile: {
                _id: userId,
                username: userObj.username,
                name: userObj.name,
                email: userObj.email
            },
            preferences: {
                Actor: [],
                Genre: [],
                Crew: [],
                releaseYear: [],
                ageRating: [],
                keywords: []
            }
        };
        return Users().then((userCollection) => {
            return userCollection.insertOne(obj).then((newObj) => {
                return obj;
            }).then(obj => {
                var userId = obj._id;
                return playlist.addPlaylist(title, userId).then((playlistObj) => {
                    return playlistObj;
                }).then(playObj => {
                    return obj;
                })
            });
        });
    },

    //delete user
    deleteUserById(id) {
        return Users().then((userCollection) => {
            return userCollection.deleteOne({ _id: id }).then(function (deletionInfo) {
                if (deletionInfo.deletedCount === 0) throw "Could not find the document with this id to delete";
                return true;
            });
        }).catch((error) => {
            return error;
        })
    },

    //update user
    updateUserById(id, obj) {
        let newData = {};
        if (obj.password) {
            var salt = bcrypt.genSaltSync(10);
            var hashedPassword = bcrypt.hashSync(obj.password, salt);
            newData.password = hashedPassword;
        }
        if (obj.email) {
            newData['profile.email'] = obj.email;
        }
        let updateCommand = {
            $set: newData
        };
        return Users().then((userCollection) => {
            return userCollection.update({ _id: id }, updateCommand).then(function () {
                return id;
            });
        }).then(id => {
            return this.getUserById(id);
        }).catch((error) => {
            return error;
        })
    },

    updateGenre(id, genreList) {
        return Users().then((userCollection) => {
            return userCollection.update({ _id: id }, { $set: { "preferences.Genre": genreList } }).then(function () {
                return id;
            });
        }).then(id => {
            return this.getUserById(id);
        }).catch((error) => {
            return error;
        })
    },

    updateAgeRating(id, ageRating) {
        return Users().then((userCollection) => {
            return userCollection.update({ _id: id }, { $set: { "preferences.ageRating": ageRating } }).then(function () {
                return id;
            });
        }).then(id => {
            return this.getUserById(id);
        }).catch((error) => {
            return error;
        })
    },

    updateReleaseYear(id, releaseYear) {
        return Users().then((userCollection) => {
            return userCollection.update({ _id: id }, { $set: { "preferences.releaseYear": releaseYear } }).then(function () {
                return id;
            });
        }).then(id => {
            return this.getUserById(id);
        }).catch((error) => {
            return error;
        })
    },

    updateKeywords(id, keywords) {
        return Users().then((userCollection) => {
            return userCollection.update({ _id: id }, { $set: { "preferences.keywords": keywords } }).then(function () {
                return id;
            });
        }).then(id => {
            return this.getUserById(id);
        }).catch((error) => {
            return error;
        })
    },

    updateActor(id, actorList) {
        return Users().then((userCollection) => {
            return userCollection.update({ _id: id }, { $set: { "preferences.Actor": actorList } }).then(function () {
                return id;
            });
        }).then(id => {
            return this.getUserById(id);
        }).catch((error) => {
            return error;
        })
    },

    updateCrew(id, crewList) {
        return Users().then((userCollection) => {
            return userCollection.update({ _id: id }, { $set: { "preferences.Crew": crewList } }).then(function () {
                return id;
            });
        }).then(id => {
            return this.getUserById(id);
        }).catch((error) => {
            return error;
        })
    },

    //add user without preferences
    addUser(username, pwd, name, email) {
        return Users().then((userCollection) => {
            var userId = uuid.v4();
            var salt = bcrypt.genSaltSync(10);
            var hashedPassword = bcrypt.hashSync(pwd, salt);
            var obj = {
                _id: userId,
                password: hashedPassword,
                profile: {
                    _id: userId,
                    username: username,
                    name: name,
                    email: email
                },
                preferences: {
                    Actor: [],
                    Genre: [],
                    Crew: [],
                    releaseYear: [],
                    ageRating: [],
                    keywords: []
                }
            };
            return userCollection.insertOne(obj).then((userObj) => {
                if (!userObj) throw "failed";
                return userObj.insertedId;
            }).then(newId => {
                return this.getUserById(newId);
            }).catch((error) => {
                return error;
            });
        });
    },

    //verify user
    verifyUser(obj) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ $and: [{ "profile.username": obj.username }, { password: obj.password }] }).then((userObj) => {
                if (!userObj) throw "Users not found";

                return this.updateUserById(userObj._id, userObj);;
            }).catch((error) => {
                return error;
            });

        });
    },

    //check if user exists
    checkUserExist(username) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ "profile.username": username }).then((userObj) => {
                if (!userObj) return false;
                return true;
            }).catch((error) => {
                return error;
            });

        });
    },

    //check if email exists
    checkEmailExist(email) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ "profile.email": email }).then((userObj) => {
                if (!userObj) return false;
                return true;
            }).catch((error) => {
                return error;
            });

        });
    },

    registrationVerification(password, confirmedPassword, username, email) {
        return new Promise((resolve, reject) => {
            if (!password) { Promise.reject("A password must be provided") };
            if (!confirmedPassword) { Promise.reject("A confirmed password must be provided") };
            if (!username) { Promise.reject("A username must be provided") };
            if (!email) { Promise.reject("An email must be provided") };
            if (password != confirmedPassword) { reject("Entered password and confirmed password must match") };
            return this.checkUserExist(username).then((result) => {
                if (result === false) {
                    resolve(true);
                }
                else {
                    reject("Username already exists");
                }
            });
        });
    },

    checkPasswordsMatch(password, confirmedPassword) {
        return new Promise((resolve, reject) => {
            if (password != confirmedPassword) { reject("Entered password and confirmed password must match") };
        });
    }

}

module.exports = exportedMethods;
