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
    var messageId = data.requestId;
    var username = data.username;
    var password = data.password;
    var confirmedPassword = data.confirmedPassword;
    var email = data.email;
    var name = data.name;
    var user = {
        password: password,
        username: username,
        name: name,
        email: email
    };
    var title = "My Playlist";
    console.log(confirmedPassword);
    var verify = userData.registrationVerification(password, confirmedPassword, username, email);
    verify.then(() => {
        var fullyComposeUser = userData
            .addUsersAndPlaylist(title, user)
            .then((newUser) => {
                //cache user by userid
                console.log(newUser);
                var addEntry = client.setAsync(newUser.user_id, JSON.stringify(user));
                addEntry.then(() => {
                    redisConnection.emit(`user-registered:${messageId}`, newUser.user_id);
                }).catch(error => {
                    redisConnection.emit(`user-registered-failed:${messageId}`, error);
                });
            }).catch(error => {
                redisConnection.emit(`user-registered-failed:${messageId}`, error);
            });
    }).catch((error) => {
        console.log(error);
        redisConnection.emit(`user-registered-failed:${messageId}`, error);
    });
});

//UPDATE USER WORKER
redisConnection.on('update-user:*', (data, channel) => {
    var messageId = data.requestId;
    var newData = data.update;
    var userId = data.userId;
    //update user information - also update cache entry (if exists)
    var fullyComposeUser = userData
        .updateUserById(userId, newData)
        .then((updatedUser) => {
            var entryExists = client.getAsync(userId);
            entryExists.then((userInfo) => {
                var userData = updatedUser;
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
    var messageId = data.requestId;
    var userId = data.userId;
    var sessionData = data.session;
    //delete user in db and all related cache entries
    var deleteEntry = client.delAsync(userId); //delete user entry
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
    var messageId = data.requestId;
    //get all users
    var fullyComposeUser = userData
        .getAllUsers()
        .then((users) => {
            redisConnection.emit(`users-retrieved:${messageId}`, users);
        }).catch(error => {
            redisConnection.emit(`users-retrieved-failed:${messageId}`, error);
        });
});

//GET USER WORKER
redisConnection.on('get-user:*', (data, channel) => {
    var messageId = data.requestId;
    var userId = data.userId;
    //get user information - check if exists in cache first
    var entryExists = client.getAsync(userId);
    entryExists.then((userInfo) => {
        if (userInfo) { //retrieve cached data
            console.log(userInfo);
            redisConnection.emit(`user-retrieved:${messageId}`, JSON.parse(userInfo));
        }
        else { //retrieve from db
            var fullyComposeUser = userData
                .getUserById(userId)
                .then((user) => {
                    var retrieveUser = client.setAsync(userId, JSON.stringify(user));
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
    var messageId = data.requestId;
    var sessionData = data.session;
    //add session to cache using token
    var addEntry = client.setAsync(sessionData.token, JSON.stringify(sessionData));
    addEntry.then(() => {
        redisConnection.emit(`logged-in:${messageId}`, sessionData);
    }).catch((error) => {
        redisConnection.emit(`login-failed:${messageId}`, error);
    });
});

//USER PREFERENCES WORKER  -->get from cache?
redisConnection.on('get-preferences:*', (data, channel) => {
    var messageId = data.requestId;
    var userId = data.userId;
    //get preferences 
    var fullyComposeUser = userData
        .getUserPreferences(userId)
        .then((preferences) => {
            redisConnection.emit(`preferences-retrieved:${messageId}`, preferences);
        }).catch((error) => {
            redisConnection.emit(`preferences-retrieved-failed:${messageId}`, error);
        });
});
