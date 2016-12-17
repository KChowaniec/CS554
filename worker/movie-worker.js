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

//GET ALL REVIEWS FOR MOVIE WORKER
redisConnection.on('get-all-reviews:*', (data, channel) => {
    var messageId = data.requestId;
    var movieId = data.movieId;
    //get all reviews
    var fullyComposeMovie = movieData.getAllReviews(movieId).then((reviews) => {
        redisConnection.emit(`all-reviews-retrieved:${messageId}`, reviews);
    }).catch(error => {
        redisConnection.emit(`all-reviews-retrieved-failed:${messageId}`, error);
    });
});


//ADD REVIEW TO MOVIE
redisConnection.on('add-review:*', (data, channel) => {
    var messageId = data.requestId;
    var userId = data.userId;
    var movieId = data.movieId;
    var reviewData = data.reviewData;
    reviewData.date = new Date();
    var postReview = movieData.addReviewToMovie(movieId, userId, reviewData.rating, reviewData.date, reviewData.comment);
    postReview.then((movieInfo) => {
        redisConnection.emit(`added-review:${messageId}`, movieInfo);
    }).catch(error => {
        redisConnection.emit(`added-review-failed:${messageId}`, error);
    });
});

//REMOVE REVIEW FROM MOVIE 
redisConnection.on('remove-review:*', (data, channel) => {
    var messageId = data.requestId;
    var movieId = data.movieId;
    var reviewId = data.reviewId;
    var removeReview = movieData.removeReviewByReviewId(movieId, reviewId).then((movie) => {
        redisConnection.emit(`removed-review:${messageId}`, movie);
    }).catch(error => {
        redisConnection.emit(`removed-review-failed:${messageId}`, error);
    });
});

//GET MOVIE DETAILS WORKER
redisConnection.on('get-details:*', (data, channel) => {
    console.log("in movie details");
    let messageId = data.requestId;
    let movieId = data.movieId;
    console.log(movieId);
    let entryExists = client.getAsync(movieId);
    entryExists.then((movieInfo) => {
        if (movieInfo) { //retrieve cached data
            redisConnection.emit(`details-retrieved:${messageId}`, JSON.parse(movieInfo));
        }
        else { //retrieve from db
            console.log("getting from db");
            let fullyComposeMovie = apiData
                .getMovieDetails(movieId)
                .then((details) => {
                    console.log(details);
                    let cacheMovie = client.setAsync(movieId, JSON.stringify(details));
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

redisConnection.on('get-recommendations:*', (data, channel) => {
    var movieId = data.movieId;
    var messageId = data.requestId;
    var fullyComposeMovie = apiData
        .getMovieRecommendations(movieId)
        .then((movies) => {
            redisConnection.emit(`recommendations-retrieved:${messageId}`, movies);
        }).catch(error => {
            console.log(error);
            redisConnection.emit(`recommendations-retrieved-failed:${messageId}`, error);
        });
});

//GET REVIEWS FROM API
redisConnection.on('get-reviews:*', (data, channel) => {
    var movieId = data.movieId;
    var messageId = data.requestId;
    var fullyComposeMovie = apiData
        .getMovieReviews(movieId)
        .then((movies) => {
            redisConnection.emit(`reviews-retrieved:${messageId}`, movies);
        }).catch(error => {
            console.log(error);
            redisConnection.emit(`reviews-retrieved-failed:${messageId}`, error);
        });
});
