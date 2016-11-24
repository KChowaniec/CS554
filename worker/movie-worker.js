const dbCollection = require("data");
const movieData = dbCollection.movie;
const apiData = dbCollection.api;
const fetch = require('node-fetch');
const bluebird = require("bluebird");
const flat = require("flat");
const unflatten = flat.unflatten;

const NRP = require('node-redis-pubsub');
const config = {
    port: 6379, // Port of your locally running Redis server
    scope: 'movieSearch' // Use a scope to prevent two NRPs from sharing messages
};
// const config = require("./redis-config.js");
const redis = require('redis');
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisConnection = new NRP(config); // This is the NRP client

//ADD MOVIE WORKER
redisConnection.on('add-movie:*', (data, channel) => {
});

//GET ALL REVIEWS FOR MOVIE WORKER
redisConnection.on('get-reviews:*', (data, channel) => {
    let messageId = data.requestId;

});

//GET MOVIE DETAILS WORKER
redisConnection.on('get-details:*', (data, channel) => {
    let messageId = data.requestId;
    let movieId = data.movieId;
    let entryExists = client.getAsync(movieId);
    entryExists.then((movieInfo) => {
        if (movieInfo) { //retrieve cached data
            redisConnection.emit(`details-retrieved:${messageId}`, unflatten(movieInfo));
        }
        else { //retrieve from db
            let fullyComposeMovie = apiData
                .getMovieDetails(movieId)
                .then((details) => {
                    let cacheMovie = client.setAsync(movieId, flat(details));
                    cacheMovie.then(() => {
                        redisConnection.emit(`details-retrieved:${messageId}`, details);
                    }).catch(error => {
                        redisConnection.emit(`details-retrieved-failed:${messageId}`, error);
                    });
                });
        }
    }).catch(error => {
        redisConnection.emit(`details-retrieved-failed:${messageId}`, error);
    });
});

//DELETE MOVIE WORKER
redisConnection.on('delete-movie:*', (data, channel) => {

});

//GET REVIEW WORKER
redisConnection.on('get-review:*', (data, channel) => {
    let messageId = data.requestId;

});

