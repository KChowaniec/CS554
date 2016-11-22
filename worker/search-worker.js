const dbCollection = require("data");
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
    // let messageId = data.requestId;
    // let playlistInfo = data.playlist;
    // //add user to database, set of all users in cache and own cache entry
    // let fullyComposePlaylist = movieData
    //     .addPlaylist(playlist.title, playlist.user)
    //     .then((newPlaylist) => {
    //         //cache playlist by id
    //         let addEntry = client.setAsync(newPlaylist._id, JSON.stringify(newPlaylist));
    //         addEntry.then(() => {
    //             redisConnection.emit(`query-created:${messageId}`, newPlaylist);
    //         }).catch(error => {
    //             redisConnection.emit(`query-created-failed:${messageId}`, error);
    //         });
    //     });
});

//SEARCH MOVIES API WORKER
redisConnection.on('search-movies:*', (data, channel) => {
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
    //                 redisConnection.emit(`movies-retrieved:${messageId}`, movieData);
    //             }
    //             else {
    //                 redisConnection.emit(`movies-retrieved:${messageId}`, updatedUser);
    //             }
    //         }).catch(error => {
    //             redisConnection.emit(`movies-retrieved-failed:${messageId}`, error);
    //         });
    //     }).catch(error => {
    //         redisConnection.emit(`movies-retrieved-failed:${messageId}`, error);
    //     });
});

//GET KEYWORD IDS API WORKER
redisConnection.on('get-keyword:*', (data, channel) => {
    //     let messageId = data.requestId;
    //     let playlistId = data.playlistId;
    //     //delete user in db and all related cache entries
    //     let fullyComposePlaylist = movieData
    //         .clearPlaylist(playlistId)
    //         .then((list) => {
    //             return client.delAsync(playlistId);
    //         }).then(() => {
    //             redisConnection.emit(`keyword-retrieved:${messageId}`, deleted);
    //         }).catch(error => {
    //             redisConnection.emit(`keyword-retrieved-failed:${messageId}`, error);
    //         });
    // }).catch(error => {
    //     redisConnection.emit(`playlist-cleared-failed:${messageId}`, error);
});

//GET PEOPLE IDS API WORKER
redisConnection.on('get-person:*', (data, channel) => {
    // let messageId = data.requestId;
    // let userId = data.userId;
    // let fullyComposePlaylist = movieData
    //     .getPlaylistByUserId(userId)
    //     .then((playlist) => {
    //         redisConnection.emit(`person-retrieved:${messageId}`, playlist);
    //     }).catch(error => {
    //         redisConnection.emit(`person-retrieved-failed:${messageId}`, error);
    //     });
});

