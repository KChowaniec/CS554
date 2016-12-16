const dbCollection = require("data");
const playlistData = dbCollection.playlist;
const movieData = dbCollection.movie;
const apiData = dbCollection.api;
const historyData = dbCollection.history;
const fetch = require('node-fetch');
const bluebird = require("bluebird");
const flat = require("flat");
const unflatten = flat.unflatten;

const NRP = require('node-redis-pubsub');
const config = {
    port: 6379, // Port of your locally running Redis server
    scope: 'movieSearch' // Use a scope to prevent two NRPs from sharing messages
};
// const config = require("./redis-config");
const redis = require('redis');
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisConnection = new NRP(config); // This is the NRP client

//CREATE PLAYLIST WORKER
redisConnection.on('create-playlist:*', (data, channel) => {
    let messageId = data.requestId;
    let playlistInfo = data.playlist;
    //add user to database, set of all users in cache and own cache entry
    let fullyComposePlaylist = playlistData
        .addPlaylist(playlist.title, playlist.user)
        .then((newPlaylist) => {
            redisConnection.emit(`playlist-created:${messageId}`, newPlaylist);
        }).catch(error => {
            redisConnection.emit(`playlist-created-failed:${messageId}`, error);
        });
});

//ADD MOVIE TO PLAYLIST WORKER (and to movie & history collections), also update playlist cache entry
redisConnection.on('add-movie-playlist:*', (data, channel) => {
    let messageId = data.requestId;
    let movieId = data.movieId;
    let userId = data.userId;

    let fullyComposePlaylist = playlistData
        .getPlaylistByUserId(userId)
        .then((userPlaylist) => {
            //check if movie already exists in playlist
            var currentMovies = userPlaylist.playlistMovies;
            var index = currentMovies.map(function (e) { return e._id; }).indexOf(movieId);
            if (index == -1) { //movie not in playlist
                if (userPlaylist.playlistMovies.length == 10) {
                    let error = "You have reached the maximum of 10 movies in your playlist";
                    redisConnection.emit(`added-movie-failed:${messageId}`, error);
                }
                else {
                    //check if movie exists in cache then go to db
                    var movieInfo = "";
                    // movieData.getMovieById(movieId).then((details) => {
                    //     if (!details) { //get details using api
                    var newMovie = apiData.getMovieDetails(movieId).then((info) => {
                        return info;
                        //cache movie details
                        // let addEntry = client.setAsync(movieId, flat(info));
                        // addEntry.then(() => {
                        //insert movie into movie collection if doesn't exist already'
                        //       movieData.addMovie(info._id).then((result) => {
                        // }).catch((error) => {
                        //     redisConnection.emit(`added-movie-failed:${messageId}`, error);
                        // });
                    });
                    //    });
                    //  }
                    Promise.all([newMovie]).then(values => {
                        if (values[0]) {
                            movieInfo = values[0];
                        }
                        else {
                            movieInfo = details;
                        }
                        var userId = userId;
                        var title = movieInfo.title;
                        var overview;
                        if (movieInfo.description) {
                            overview = movieInfo.description;
                        }
                        else {
                            overview = movieInfo.overview;
                        }
                        //insert movie into playlist collection
                        var newList = playlistData.addMovieToPlaylist(userPlaylist._id, movieId, title, overview, movieInfo.poster_path);
                        newList.then((addedMovie) => {
                            redisConnection.emit(`added-movie:${messageId}`, addedMovie);
                        }).catch((error) => {
                            redisConnection.emit(`added-movie-failed:${messageId}`, error);
                        });
                    }).catch((error) => {
                        redisConnection.emit(`added-movie-failed:${messageId}`, error);
                    });
                }

            }
            else {
                let error = "This movie is already in your playlist";
                redisConnection.emit(`added-movie-failed:${messageId}`, error);
            }
        }).catch((error) => {
            redisConnection.emit(`added-movie-failed:${messageId}`, error);
        });
});

//CLEAR PLAYLIST WORKER
redisConnection.on('clear-playlist:*', (data, channel) => {
    let messageId = data.requestId;
    let playlistId = data.playlistId;
    //delete user in db and all related cache entries
    let fullyComposePlaylist = playlistData
        .clearPlaylist(playlistId)
        .then((list) => {
            redisConnection.emit(`playlist-cleared:${messageId}`, playlistId);
        }).catch(error => {
            redisConnection.emit(`playlist-cleared-failed:${messageId}`, error);
        });
});

//GET MOVIES IN PLAYLIST WORKER
redisConnection.on('get-playlist:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let fullyComposePlaylist = playlistData
        .getPlaylistByUserId(userId)
        .then((playlist) => {
            console.log("IN playlist Worker");
            console.log(playlist);
            redisConnection.emit(`playlist-retrieved:${messageId}`, playlist);
        }).catch(error => {
            redisConnection.emit(`playlist-retrieved-failed:${messageId}`, error);
        });
});

//CHECK-OFF MOVIE IN PLAYLIST WORKER
redisConnection.on('checkoff-movie:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let movieId = data.movieId;

    let fullyComposePlaylist = playlistData
        .getPlaylistByUserId(userId)
        .then((playlist) => {
            playlistData.checkOffMovie(playlist_id, movieId).then((newList) => {
                redisConnection.emit(`checked-off:${messageId}`, playlist);
            }).catch(error => {
                redisConnection.emit(`checked-off-failed:${messageId}`, error);
            });
        });
});


//REMOVE MOVIE FROM PLAYLIST
redisConnection.on('remove-movie-playlist:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let movieId = data.movieId;
    //get playlist information
    let fullyComposePlaylist = playlistData
        .getPlaylistByUserId(userId)
        .then((playlist) => {
            playlistData.removeMovieByMovieId(playlist._id, movieId)
                .then((newPlaylist) => {
                    redisConnection.emit(`removed-movie:${messageId}`, newPlaylist);
                }).catch(error => {
                    redisConnection.emit(`removed-movie-failed:${messageId}`, error);
                });
        }).catch(error => {
            redisConnection.emit(`removed-movie-failed:${messageId}`, error);
        });
});



//UPDATE PLAYLIST TITLE
redisConnection.on('update-playlist-title:*', (data, channel) => {
    let messageId = data.requestId;
    let playlistId = data.playlistId;
    let title = data.title;
    let fullyComposePlaylist = playlistData
        .setNewTitle(playlistId, title)
        .then((playlist) => {
            redisConnection.emit(`title-updated:${messageId}`, playlist);
        }).catch(error => {
            redisConnection.emit(`title-updated-failed:${messageId}`, error);
        });
});

//EXPORT PLAYLIST WORKER
redisConnection.on('export-playlist:*', (data, channel) => {
    let messageId = data.requestId;
    let userId = data.userId;
    let filePath = data.filePath;
    let fullyComposePlaylist = playlistData
        .getPlaylistByUserId(userId)
        .then((playlistInfo) => {
            playlistData.exportPlaylist(playlistInfo._id, filePath).then((playlist) => {
                redisConnection.emit(`playlist-exported:${messageId}`, playlist);
            }).catch(error => {
                redisConnection.emit(`playlist-exported-failed:${messageId}`, error);
            });
        }).catch(error => {
            redisConnection.emit(`playlist-exported-failed:${messageId}`, error);
        });
});

//IMPORT PLAYLIST WORKER
redisConnection.on('import-playlist:*', (data, channel) => {
    let messageId = data.requestId;
    let filePath = data.filePath;

    let fullyComposePlaylist = playlistData
        .importPlaylist(filePath)
        .then((data) => {
            redisConnection.emit(`playlist-imported:${messageId}`, data);
        }).catch(error => {
            redisConnection.emit(`playlist-imported-failed:${messageId}`, error);
        });
});
