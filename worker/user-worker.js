const dbCollection = require("data");
const userData = dbCollection.users;
const fetch = require('node-fetch');
const bluebird = require("bluebird");

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

//REGISTRATION WORKER
redisConnection.on('register-user:*', (data, channel) => {
    let messageId = data.requestId;
    let username = data.username;
    let password = data.password;
    let confirmedPassword = data.password;
    let email = data.email;
    let name = data.name;
    let user = {
        pwd: password,
        username: username,
        name: name,
        email: email
    };
    let title = "My Playlist";
    let verify = userData.registrationVerification(password, confirmedPassword, username, email);
    verify.then(() => {
        let fullyComposeUser = userData
            .addUsersAndPlaylist(title, user)
            .then((newUser) => {
                //cache user by userid
                let addEntry = client.setAsync(user._id, JSON.stringify(user));
                addEntry.then(() => {
                    redisConnection.emit(`user-registered:${messageId}`, newUser.user_id);
                }).catch(error => {
                    redisConnection.emit(`user-registered-failed:${messageId}`, error);
                });
            }).catch(error => {
                redisConnection.emit(`user-registered-failed:${messageId}`, error);
            });
    }).catch((error) => {
        redisConnection.emit(`user-registered-failed:${messageId}`, error);
    });
});

//UPDATE USER WORKER
redisConnection.on('update-user:*', (data, channel) => {
    let messageId = data.requestId;
    let newData = data.update;
    let userId = data.userId;
    //update user in db and all cache entries
    let fullyComposeUser = userData
        .updateUserById(userId, newData)
        .then((updatedUser) => {
            let entryExists = client.getAsync(userId);
            entryExists.then((userInfo) => {
                let userData = updatedUser;
                if (userInfo) { //reset expiration time if user entry exists
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
    //get user information
    let fullyComposeUser = userData
        .getUserById(userId)
        .then((user) => {
            let cacheUsers = client.setAsync(userId, JSON.stringify(user));
            cacheUsers.then(() => {
                redisConnection.emit(`user-retrieved:${messageId}`, user);
            }).catch(error => {
                redisConnection.emit(`user-retrieved-failed:${messageId}`, error);
            });
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
