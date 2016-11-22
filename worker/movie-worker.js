const dbCollection = require("data");
const movieData = dbCollection.movie;
const apiData = dbCollection.api;
const fetch = require('node-fetch');
const bluebird = require("bluebird");

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
    // let messageId = data.requestId;
    // let playlistInfo = data.playlist;
    // //add user to database, set of all users in cache and own cache entry
    // let fullyComposeMovie = movieData
    //     .addPlaylist(playlist.title, playlist.user)
    //     .then((newPlaylist) => {
    //         //cache playlist by id
    //         let addEntry = client.setAsync(newPlaylist._id, JSON.stringify(newPlaylist));
    //         addEntry.then(() => {
    //             redisConnection.emit(`movie-added:${messageId}`, newPlaylist);
    //         }).catch(error => {
    //             redisConnection.emit(`movie-added-failed:${messageId}`, error);
    //         });
    //     });
});

//GET ALL REVIEWS FOR MOVIE WORKER
redisConnection.on('get-reviews:*', (data, channel) => {
    let messageId = data.requestId;
    // let newData = data.update;
    // let user = data.user;
    // //update user in db and all cache entries
    // let fullyComposeUser = movieData
    //     .updateUserById(user._id, newData)
    //     .then((updatedUser) => {
    //         let entryExists = client.getAsync(user._id);
    //         entryExists.then((userInfo) => {
    //             let movieData = updatedUser;
    //             if (userInfo) { //reset expiration time if user entry exists
    //                 client.setAsync(movieData._id, JSON.stringify(movieData)); // user entry
    //                 redisConnection.emit(`added-movie:${messageId}`, movieData);
    //             }
    //             else {
    //                 redisConnection.emit(`added-movie:${messageId}`, updatedUser);
    //             }
    //         }).catch(error => {
    //             redisConnection.emit(`added-movie-failed:${messageId}`, error);
    //         });
    //     }).catch(error => {
    //         redisConnection.emit(`added-movie-failed:${messageId}`, error);
    //     });
});

//GET MOVIE DETAILS WORKER
redisConnection.on('get-details:*', (data, channel) => {
//     let messageId = data.requestId;
//     let playlistId = data.playlistId;
//     //delete user in db and all related cache entries
//     let fullyComposeMovie = movieData
//         .clearPlaylist(playlistId)
//         .then((list) => {
//             return client.delAsync(playlistId);
//         }).then(() => {
//             redisConnection.emit(`details-retrieved:${messageId}`, deleted);
//         }).catch(error => {
//             redisConnection.emit(`details-retrieved-failed:${messageId}`, error);
//         });
// }).catch(error => {
//     redisConnection.emit(`details-retrieved-failed:${messageId}`, error);
});

//DELETE MOVIE WORKER
redisConnection.on('delete-movie:*', (data, channel) => {
    // let messageId = data.requestId;
    // let userId = data.userId;
    // let fullyComposeMovie = movieData
    //     .getPlaylistByUserId(userId)
    //     .then((playlist) => {
    //         redisConnection.emit(`movie-deleted:${messageId}`, playlist);
    //     }).catch(error => {
    //         redisConnection.emit(`movie-deleted-failed:${messageId}`, error);
    //     });
});

//GET REVIEW WORKER
redisConnection.on('get-review:*', (data, channel) => {
    let messageId = data.requestId;
    // let userId = data.userId;
    // let fullyComposeMovie = movieData
    //     .getPlaylistByUserId(userId)
    //     .then((playlist) => {
    //         redisConnection.emit(`review-retrieved:${messageId}`, playlist);
    //     }).catch(error => {
    //         redisConnection.emit(`review-retrieved-failed:${messageId}`, error);
    //     });
});

