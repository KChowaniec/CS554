// const dbCollection = require("data");
// const playlistData = dbCollection.playlist;
// const fetch = require('node-fetch');
// const bluebird = require("bluebird");

// const NRP = require('node-redis-pubsub');
// const config = {
//     port: 6379, // Port of your locally running Redis server
//     scope: 'movieSearch' // Use a scope to prevent two NRPs from sharing messages
// };

// const redis = require('redis');
// const client = redis.createClient();

// bluebird.promisifyAll(redis.RedisClient.prototype);
// bluebird.promisifyAll(redis.Multi.prototype);

// const redisConnection = new NRP(config); // This is the NRP client
// //add to playlist worker - also inserts to history table

// //CREATE PLAYLIST WORKER
// redisConnection.on('create-playlist:*', (data, channel) => {
//     let messageId = data.requestId;
//     let playlistInfo = data.playlist;
//         //add user to database, set of all users in cache and own cache entry
//         let fullyComposePlaylist= playlistData
//             .addPlaylist(playlist.title, playlist.user)
//             .then((newPlaylist) => {
//                 //cache user by userid
//                 let addEntry = client.setAsync(newPlaylist._id, JSON.stringify(newPlaylist));
//                 addEntry.then(() => {
//                     redisConnection.emit(`playlist-created:${messageId}`, newPlaylist);
//             }).catch(error => {
//                 redisConnection.emit(`playlist-created-failed:${messageId}`, error);
//             });
// })

// //ADD MOVIE TO PLAYLIST WORKER (and to history table)
// redisConnection.on('add-movie-playlist:*', (data, channel) => {
//     let messageId = data.requestId;
//     let newData = data.update;
//     let user = data.user;
//     //update user in db and all cache entries
//     let fullyComposeUser = userData
//         .updateUserById(user._id, newData)
//         .then((updatedUser) => {
//             let entryExists = client.getAsync(user._id);
//             entryExists.then((userInfo) => {
//                 let userData = updatedUser;
//                 if (userInfo) { //reset expiration time if user entry exists
//                     client.setAsync(userData._id, JSON.stringify(userData)); // user entry
//                     redisConnection.emit(`added-movie:${messageId}`, userData);
//                 }
//                 else {
//                     redisConnection.emit(`added-movie:${messageId}`, updatedUser);
//                 }
//             }).catch(error => {
//                 redisConnection.emit(`added-movie-failed:${messageId}`, error);
//             });
//         }).catch(error => {
//             redisConnection.emit(`added-movie-failed:${messageId}`, error);
//         });
// });

// //CLEAR PLAYLIST WORKER
// redisConnection.on('clear-playlist:*', (data, channel) => {
//     let messageId = data.requestId;
//     let playlistId = data.playlistId;
//     //delete user in db and all related cache entries
//     let fullyComposePlaylist = playlistData
//         .clearPlaylist(playlistId)
//         .then((list) => {
//             return  client.setAsync(playlistId, JSON.stringify(list));
//             }).then(() => {
//                 redisConnection.emit(`playlist-cleared:${messageId}`, deleted);
//             }).catch(error => {
//                 redisConnection.emit(`playlist-clear-failed:${messageId}`, error);
//             });
//         }).catch(error => {
//             redisConnection.emit(`playlist-clear-failed:${messageId}`, error);
//         });
// });

// //GET ALL MOVIES IN PLAYLIST WORKER
// redisConnection.on('get-playlist:*', (data, channel) => {
//     let messageId = data.requestId;
//     let userId = data.userId;
//     let fullyComposePlaylist = playlistData
//         .getPlaylistByUserId(userId)
//         .then((playlist) => {
//                 redisConnection.emit(`playlist-retrieved:${messageId}`, playlist);
//             }).catch(error => {
//                 redisConnection.emit(`playlist-retrieved-failed:${messageId}`, error);
//         });
// });

// //REMOVE MOVIE FROM PLAYLIST
// redisConnection.on('remove-movie-playlist:*', (data, channel) => {
//     let messageId = data.requestId;
//     let userId = data.userId;
//     //get user information
//     let fullyComposeUser = userData
//         .getUserById(userId)
//         .then((user) => {
//             let cacheUsers = client.setAsync(userId, JSON.stringify(user));
//             cacheUsers.then(() => {
//                 redisConnection.emit(`removed-movie:${messageId}`, user);
//             }).catch(error => {
//                 redisConnection.emit(`removed-movie-failed:${messageId}`, error);
//             });
//         }).catch(error => {
//             redisConnection.emit(`removed-movie-failed:${messageId}`, error);
//         });
// });

// //ADD REVIEW TO MOVIE IN PLAYLIST (and also to movie collection)
// redisConnection.on('add-review:*', (data, channel) => {
//     let messageId = data.requestId;
//     let userId = data.userId;
//     //get user information
//     let fullyComposeUser = userData
//         .getUserById(userId)
//         .then((user) => {
//             let cacheUsers = client.setAsync(userId, JSON.stringify(user));
//             cacheUsers.then(() => {
//                 redisConnection.emit(`added-review:${messageId}`, user);
//             }).catch(error => {
//                 redisConnection.emit(`added-review-failed:${messageId}`, error);
//             });
//         }).catch(error => {
//             redisConnection.emit(`added-review-failed:${messageId}`, error);
//         });
// });

