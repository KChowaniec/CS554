const dbCollection = require("data");
const userData = dbCollection.users;
const apiData = dbCollection.api;
const formData = dbCollection.form;
const fetch = require('node-fetch');
const bluebird = require("bluebird");

const NRP = require('node-redis-pubsub');
const config = {
    port: 6379, // Port of your locally running Redis server
    scope: 'movieSearch' // Use a scope to prevent two NRPs from sharing messages
};
//const config = require("./redis-config.js");
const redis = require('redis');
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisConnection = new NRP(config); // This is the NRP client

//QUERY STRING FOR MOVIE API WORKER
redisConnection.on('create-query:*', (data, channel) => {
    var messageId = data.requestId;
    var query = data.query;
    var title = data.title;
    //helper functions
    var fn = function getId(name) {
        return new Promise((fulfill, reject) => {
            return apiData.getPersonIdByName(name).then((newId) => {
                fulfill(parseInt(newId.results[0].id));
            });
        });
    };
    
    //helper functions
    var wordLookup = function getKeywordId(name) {
        return new Promise((fulfill, reject) => {
            return apiData.getKeywordIdByName(name).then((newId) => {
                fulfill(parseInt(newId.results[0].id));
            });
        });
    };

    //get all actor ids
    if (query.actors) {
        var actorId = query.actors.map(fn);
        var actorIds = Promise.all(actorId);
    }
    //get all crew ids
    if (query.crew) {
        var crewId = query.crew.map(fn);
        var crewIds = Promise.all(crewId);
    }
    //get all keyword ids
    if (query.keywords) {
        var keywordId = query.keywords.map(wordLookup);
        var wordIds = Promise.all(keywordId);
    }
    //wait until all values are retrieved
    Promise.all([crewIds, actorIds, wordIds]).then(values => {
        
        var crewList, actorList = [], keywordList = [];
        if (values[0]) {
            crewList = values[0];
        }
        if (values[1]) {
            actorList = values[1];
        }

        if (values[2]) {
            keywordList = values[2];
        }
        if (title) {
            //SEARCH BY MOVIE TITLE
            var criteriaString = "title=" + title;
            redisConnection.emit(`query-created:${messageId}`, criteriaString);
        }   
        else {
            //SEARCH BY CRITERIA

            try{
                var criteriaString = formData.createQueryString(actorList, query.genre, crewList, query.rating, query.evaluation, query.year, keywordList);
                redisConnection.emit(`query-created:${messageId}`, criteriaString);
            } catch (e) {
                console.log('Error : ' + e);
            }

        }
    }).catch(error => {
        console.log('Error in creating query string : ' + error);
        redisConnection.emit(`query-created-failed:${messageId}`, error);
    });
});

//SEARCH MOVIES API WORKER
redisConnection.on('search-movies:*', (data, channel) => {
    var messageId = data.requestId;
    var pageId = data.page;
    var queryString = data.queryString;
    var title = data.title;
    if (title !== undefined && title != "") { //search by title
        var result = apiData.searchByTitle(title, pageId);
        result.then((movies) => {
            var movielist = formData.formatReleaseDate(movies.results);
            var total = movies.total_results;
            var pages = movies.total_pages;
            var movieObj = {
                movielist: movielist,
                total: total,
                pages: pages
            };
            redisConnection.emit(`movies-retrieved:${messageId}`, movieObj);
        }).catch(error => {
            redisConnection.emit(`movies-retrieved-failed:${messageId}`, error);
        });
    }
    else { //search by criteria
        var result = apiData.searchByCriteria(queryString, pageId);
        result.then((movies) => {
            var count = movies ?  movies.length : 0;           
            var pages = movies.total_pages;
            var movielist = formData.formatReleaseDate(movies.results);
            var total = movies.total_results;
            var movieObj = {
                movielist: movielist,
                total: total,
                pages: pages
            };
            redisConnection.emit(`movies-retrieved:${messageId}`, movieObj);
        }).catch(error => {
            console.log('Error : ' + error);
            redisConnection.emit(`movies-retrieved-failed:${messageId}`, error);
        });
    }
});

//GET KEYWORD IDS API WORKER
redisConnection.on('get-keyword:*', (data, channel) => {
    var messageId = data.requestId;
    var keywordName = data.keyword;
    var fullyComposeSearch = apiData
        .searchKeywordsByName(keywordName)
        .then((keyId) => {
            redisConnection.emit(`keyword-retrieved:${messageId}`, keyId);
        }).catch(error => {
            redisConnection.emit(`keyword-retrieved-failed:${messageId}`, error);
        });
});

//GET PEOPLE IDS API WORKER
redisConnection.on('get-person:*', (data, channel) => {
    var messageId = data.requestId;
    var personName = data.person;
    var fullyComposeSearch = apiData
        .searchPersonByName(personName)
        .then((personId) => {
            redisConnection.emit(`person-retrieved:${messageId}`, personId);
        }).catch(error => {
            redisConnection.emit(`person-retrieved-failed:${messageId}`, error);
        });
});

//get person by ID
redisConnection.on('get-person-byID:*', (data, channel) => {
    var messageId = data.requestId;
    var userId = data.userId
    var personId = data.person;
    var person = {};
    var user = null;

    userData.getUserById(userId).then((data) => {
        user = data;
        apiData.getCreditByPersonId(personId).then((data) => {
            if (data.id == null || data.id == undefined) {
                redisConnection.emit(`get-person-byID-failed:${messageId}`, { success: false, message: "Person doesn't exist!" });
            }
            person.name = data.name;
            if (data.movie_credits.cast.length > 0 && data.movie_credits.cast.length > data.movie_credits.crew.length) {
                person.type = "actor";
                if (user.preferences.Actor.indexOf(person.name) === -1) {
                    user.preferences.Actor.push(person.name);
                }
            } else if (data.movie_credits.crew.length > 0) {
                person.type = "crew";
                if (user.preferences.Crew.indexOf(person.name) === -1) {
                    user.preferences.Crew.push(person.name);
                }
            }

            userData.updateActor(userId, user.preferences.Actor).then((data) => {
                userData.updateCrew(userId, user.preferences.Crew).then((data) => {
                    redisConnection.emit(`get-person-byID-success:${messageId}`, data.preferences);
                })
            });

        }).catch(error => {
            redisConnection.emit(`get-person-byID-failed:${messageId}`, error);
        })
    })



});




