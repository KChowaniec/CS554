const dbCollection = require("data");
const userData = dbCollection.users;
const fetch = require('node-fetch');
const bluebird = require("bluebird");
const flat = require("flat");
const unflatten = flat.unflatten;

const NRP = require('node-redis-pubsub');
const config = {
    port: 6379, // Port of your locally running Redis server
    scope: 'movieSearch' // Use a scope to prevent two NRPs from sharing messages
};

///const config = require("./redis-config.js");
const redis = require('redis');
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisConnection = new NRP(config); // This is the NRP client

//REGISTRATION WORKER  - add token information to session
redisConnection.on('register-user:*', (data, channel) => {
    let messageId = data.requestId;
    let username = data.username;
    let password = data.password;
    let confirmedPassword = data.confirmedPassword;
    let email = data.email;
    let name = data.name;
    let user = {
        password: password,
        username: username,
        name: name,
        email: email
    };
    let title = "My Playlist";
    let verifyUsername = userData.checkUserExist(username);
    verifyUsername.then((result) => {
        if (result == false) {
            let fullyComposeUser = userData
                .addUsersAndPlaylist(title, user)
                .then((newUser) => {
                    //cache user by userid
                    let addEntry = client.setAsync(newUser.user_id, JSON.stringify(user));
                    addEntry.then(() => {
                        redisConnection.emit(`user-registered:${messageId}`, newUser.user_id);
                    })
                }).catch(error => {
                    redisConnection.emit(`user-registered-failed:${messageId}`, error);
                });
        }
        else {
            let error = {};
            error.username = "Username already exists";
            redisConnection.emit(`user-registered-failed:${messageId}`, error);
        }
    }).catch((error) => {
        redisConnection.emit(`user-registered-failed:${messageId}`, error);
    });
});

//UPDATE USER WORKER
redisConnection.on('update-user:*', (data, channel) => {
    let messageId = data.requestId;
    let newData = data.update;
    let userId = data.userId;
    //update user information - also update cache entry (if exists)
    let fullyComposeUser = userData
        .updateUserById(userId, newData)
        .then((updatedUser) => {
            let entryExists = client.getAsync(userId);
            entryExists.then((userInfo) => {
                let userData = updatedUser;
                if (userInfo) {
                    client.setAsync(userData._id, JSON.stringify(userData)); // user entry
                    redisConnection.emit(`user-updated:${messageId}`, userData);
                }
                else {
                    redisConnection.emit(`user-updated:${messageId}`, updatedUser);
                }
            }).catch(error => {
                redisConnection.emit(`user-updated-failed:${messageId}`, error);
            });
        }).catch(error => {
            redisConnection.emit(`user-updated-failed:${messageId}`, error);
        });
});

//LOG OUT USER WORKER
redisConnection.on('logout-user:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let sessionData = data.session;
    //delete user in db and all related cache entries
    let deleteEntry = client.delAsync(userId); //delete user entry
    deleteEntry.then(() => {
        return client.delAsync(sessionData.token);
    }).then(() => {
        redisConnection.emit(`logged-out:${messageId}`, deleted);
    }).catch(error => {
        redisConnection.emit(`logout-failed:${messageId}`, error);
    });
});

//GET ALL USERS WORKER
redisConnection.on('get-users:*', (data, channel) => {
    let messageId = data.requestId;
    //get all users
    let fullyComposeUser = userData
        .getAllUsers()
        .then((users) => {
            redisConnection.emit(`users-retrieved:${messageId}`, users);
        }).catch(error => {
            redisConnection.emit(`users-retrieved-failed:${messageId}`, error);
        });
});

//GET USER WORKER
redisConnection.on('get-user:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    //get user information - check if exists in cache first
    let entryExists = client.getAsync(userId);
    entryExists.then((userInfo) => {
        if (userInfo) { //retrieve cached data
            redisConnection.emit(`user-retrieved:${messageId}`, JSON.parse(userInfo));
        }
        else { //retrieve from db
            let fullyComposeUser = userData
                .getUserById(userId)
                .then((user) => {
                    let retrieveUser = client.setAsync(userId, JSON.stringify(user));
                    retrieveUser.then(() => {
                        redisConnection.emit(`user-retrieved:${messageId}`, user);
                    }).catch(error => {
                        redisConnection.emit(`user-retrieved-failed:${messageId}`, error);
                    });
                });
        }
    }).catch(error => {
        redisConnection.emit(`user-retrieved-failed:${messageId}`, error);
    });
});

//LOGIN WORKER
redisConnection.on('login-user:*', (data, channel) => {
    let messageId = data.requestId;
    let sessionData = data.session;
    //add session to cache using token
    let addEntry = client.setAsync(sessionData.token, JSON.stringify(sessionData));
    addEntry.then(() => {
        redisConnection.emit(`logged-in:${messageId}`, sessionData);
    }).catch((error) => {
        redisConnection.emit(`login-failed:${messageId}`, error);
    });
});

//USER PREFERENCES WORKER
redisConnection.on('get-preferences:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    //get preferences
    let fullyComposeUser = userData
        .getUserPreferences(userId)
        .then((preferences) => {
            redisConnection.emit(`preferences-retrieved:${messageId}`, preferences);
        }).catch((error) => {
            redisConnection.emit(`preferences-retrieved-failed:${messageId}`, error);
        });
});


//Update Genre
redisConnection.on('update-genre:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let genreList = data.genreList;
    genreList = genreList.split(",");
    //update genre in preference
    let fullyComposeUser = userData
        .updateGenre(userId,genreList)
        .then((preferences) => {
            client.setAsync(userId, JSON.stringify(preferences));
            redisConnection.emit(`update-genre-success:${messageId}`, preferences);
        }).catch((error) => {
            console.log(error)
            redisConnection.emit(`update-genre-failed:${messageId}`, error);
        });
});

//Update Person - actor/crew
redisConnection.on('update-person:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let crew = data.crew;
    let actor = data.actor;

    console.log(crew)
    console.log(actor)
    // update actor/crew in preference
    let fullyComposeUser = userData
        .updateActor(userId,actor)
        .then((data) => {
            userData.updateCrew(userId,crew).then((data) => {
                redisConnection.emit(`update-person-success:${messageId}`, data);
            })
        }).catch((error) => {
            console.log(error)
            redisConnection.emit(`update-person-failed:${messageId}`, error);
        });
});

redisConnection.on('get-preference:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;

    console.log(userId);
    //update genre in preference
    let fullyComposeUser = userData
        .getUserById(userId)
        .then((data) => {
            // client.setAsync(user._id, JSON.stringify(data));
            redisConnection.emit(`get-preference-success:${messageId}`, data.preferences);
        }).catch((error) => {
            console.log(error);
            redisConnection.emit(`get-preference-failed:${messageId}`, error);
        });
});

