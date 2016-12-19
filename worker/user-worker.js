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

//REGISTRATION WORKER
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
    var verifyUsername = userData.checkUserExist(username);
    verifyUsername.then((result) => {
        if (result == false) {
            var fullyComposeUser = userData
                .addUsersAndPlaylist(title, user)
                .then((newUser) => {
                    //cache user by userid
                    var addEntry = client.setAsync(newUser._id, JSON.stringify(newUser));
                    addEntry.then(() => {
                        //user._id = newUser.user_id;
                        redisConnection.emit(`user-registered:${messageId}`, newUser);
                    })
                }).catch(error => {
                    redisConnection.emit(`user-registered-failed:${messageId}`, error);
                });
        }
        else {
            let error = "Username '" + username + "' already exists";
            redisConnection.emit(`user-registered-failed:${messageId}`, error);
        }
    }).catch((error) => {
        redisConnection.emit(`user-registered-failed:${messageId}`, error);
    });
});

//UPDATE USER WORKER
redisConnection.on('update-user:*', (data, channel) => {
    var messageId = data.requestId;
    // var newData = data.update;
    var email = data.email;
    var password = data.password;
    var userId = data.userId;
    var newData = {};
    if (email) {
        newData.email = email;
    }
    if (password) {
        newData.password = password;
    }
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
        //console.log('User information : ' + userInfo);
        if (userInfo) { //retrieve cached data
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

//USER PREFERENCES WORKER
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


//Update Genre
redisConnection.on('update-genre:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let genreList = data.genreList;
    if(genreList!="")
    {
        genreList = genreList.split(",");
    }else{
        genreList = [];
    }
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

//update keywords
redisConnection.on('update-keywords:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let keywords = data.keywords;
    if(keywords!="")
    {
        keywords = keywords.split(",");
    }else{
        keywords = [];
    }
    //update keywords in preference
    let fullyComposeUser = userData
        .updateKeywords(userId,keywords)
        .then((preferences) => {
            client.setAsync(userId, JSON.stringify(preferences));
            redisConnection.emit(`update-keywords-success:${messageId}`, preferences);
        }).catch((error) => {
            console.log(error)
            redisConnection.emit(`update-keywords-failed:${messageId}`, error);
        });
});


//Update Person - actor/crew
redisConnection.on('update-person:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let crew = data.crew;
    let actor = data.actor;

    if(crew==null)
    {
        crew = []
    }
    if(actor == null)
    {
        actor = []
    }
    console.log("crew",crew)
    console.log("actor",actor)
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



//Update age rating
redisConnection.on('update-ageRating:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let ageRating = data.ageRating;
    if(ageRating!="")
    {
        ageRating = ageRating.split(",");
    }else{
        ageRating = [];
    }
    //update genre in preference
    let fullyComposeUser = userData
        .updateAgeRating(userId,ageRating)
        .then((data) => {
            client.setAsync(userId, JSON.stringify(data));
            redisConnection.emit(`update-ageRating-success:${messageId}`, data);
        }).catch((error) => {
            console.log(error)
            redisConnection.emit(`update-ageRating-failed:${messageId}`, error);
        });
});


//Update release year
redisConnection.on('update-year:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let year = data.year;
    if(year!="")
    {
        year = year.split(",");
    }else{
        year = [];
    }
    //update genre in preference
    let fullyComposeUser = userData
        .updateReleaseYear(userId,year)
        .then((data) => {
            client.setAsync(userId, JSON.stringify(data));
            redisConnection.emit(`update-year-success:${messageId}`, data);
        }).catch((error) => {
            console.log(error)
            redisConnection.emit(`update-year-failed:${messageId}`, error);

        })
});
//SAVE USER PREFERENCES WORKER
redisConnection.on('save-preferences:*', (data, channel) => {
    var messageId = data.requestId;
    var userId = data.userId;
    var preferences = data.preferences;
    //get preferences 
    var fullyComposeUser = userData
        .saveUserPreferences(userId, preferences)
        .then((user) => {
            redisConnection.emit(`preferences-saved:${messageId}`, user);
        }).catch((error) => {
            redisConnection.emit(`preferences-saved-failed:${messageId}`, error);
        });
});
