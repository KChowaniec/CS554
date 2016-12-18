/*Program Title: routes/playlist.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles all /playlist routes
*/
var express = require('express');
var router = express.Router();
var data = require("data");
var api = data.api;
var playlist = data.playlist;
var users = data.users;
var xss = require('xss');
var movie = data.movie;
const uuid = require("node-uuid");
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var jsonfile = require('jsonfile');
//dialog.setContext(document)
router.get('/download', function (req, res) {
    var file = __dirname + '/../public/json/playlist_file.json';
    res.download(file);
});
//GET PLAYLIST
router.get("/", (req, res) => {
    //get playlist information
    let userId = req.session.userId;
    // REMOVE IT
    // if(userId === undefined){
    //     userId = "b7cda109-ecf2-4f17-b2ac-3b58e529a850";
    // }
    let redisConnection = req.app.get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;
    redisConnection.on(`playlist-retrieved:${messageId}`, (playlist, channel) => {
        redisConnection.off(`playlist-retrieved:${messageId}`);
        redisConnection.off(`playlist-retrieved-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        //console.log('response from get all playlist ');
        if (playlist && playlist.playlistMovies) {
            //console.log('Playlist : ' + playlist);
            var viewed = [];
            var unviewed = [];
            if (playlist.playlistMovies) {
                for (var i = 0; i < playlist.playlistMovies.length; i++) {
                    if (playlist.playlistMovies[i].viewed == true) {
                        viewed.push(playlist.playlistMovies[i]);
                    }
                    else {
                        unviewed.push(playlist.playlistMovies[i]);
                    }
                }
            }
            var file = __dirname + '/../public/json/playlist_file.json';
            jsonfile.writeFile(file, playlist.playlistMovies, {
                spaces: 2
            }, function (err) {
                console.log("Data Written to file");
            })
            res.json(playlist.playlistMovies);
        }
        else {
            playlist.playlistMovies = [];
            res.json([]);
        }
    });
    redisConnection.on(`playlist-retrieved-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`playlist-retrieved:${messageId}`);
        redisConnection.off(`playlist-retrieved-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false
            , errors: error
        });
    });
    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`playlist-retrieved:${messageId}`);
        redisConnection.off(`playlist-retrieved-failed:${messageId}`);
        res.status(500).json({
            error: "Timeout error"
        })
    }, 5000);
    redisConnection.emit(`get-playlist:${messageId}`, {
        requestId: messageId
        , userId: userId
    });
});
//CLEAR PLAYLIST
router.delete("/clear/:playlistId", (req, res) => {
    //method to clear out playlist
    let playlistId = req.params.playlistId
    let redisConnection = req.app.get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;
    redisConnection.on(`playlist-cleared:${messageId}`, (playlist, channel) => {
        redisConnection.off(`playlist-cleared:${messageId}`);
        redisConnection.off(`playlist-cleared-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        if (playlist) {
            return res.json({
                success: true
            });
        }
        else {
            return res.json({
                success: false
                , error: error
            });
        }
    });
    redisConnection.on(`playlist-cleared-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`playlist-cleared:${messageId}`);
        redisConnection.off(`playlist-cleared-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false
            , errors: error
        });
    });
    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`playlist-cleared:${messageId}`);
        redisConnection.off(`playlist-cleared-failed:${messageId}`);
        res.status(500).json({
            error: "Timeout error"
        })
    }, 5000);
    redisConnection.emit(`clear-playlist:${messageId}`, {
        requestId: messageId
        , playlistId: playlistId
    });
});
//CHECK-OFF MOVIE FROM PLAYLIST
router.put("/putmovie/:movieId", (req, res) => {
    let movieId = req.params.movieId;
    let userId = req.session.userId;
    let redisConnection = req.app.get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;
    redisConnection.on(`checked-off:${messageId}`, (result, channel) => {
        redisConnection.off(`checked-off:${messageId}`);
        redisConnection.off(`checked-off-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        if (result) {
            res.json({
                success: true
            });
        }
        else {
            res.json({
                success: false
                , error: error
            });
        }
    });
    redisConnection.on(`checked-off-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`checked-off:${messageId}`);
        redisConnection.off(`checked-off-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false
            , errors: error
        });
    });
    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`checked-off:${messageId}`);
        redisConnection.off(`checked-off-failed:${messageId}`);
        res.status(500).json({
            error: "Timeout error"
        })
    }, 5000);
    redisConnection.emit(`checkoff-movie:${messageId}`, {
        requestId: messageId
        , userId: userId
        , movieId: movieId
    });
});
//UPDATE PLAYLIST TITLE
router.put("/title/:playlistId", (req, res) => {
    //method to clear out playlist
    let newTitle = xss(req.body.title);
    let playlistId = req.params.playlistId
    let redisConnection = req.app.get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;
    redisConnection.on(`title-updated:${messageId}`, (result, channel) => {
        redisConnection.off(`title-updated:${messageId}`);
        redisConnection.off(`title-updated-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        if (result) {
            res.json({
                success: true
            });
        }
        else {
            res.json({
                success: false
                , error: error
            });
        }
    });
    redisConnection.on(`title-updated-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`title-updated:${messageId}`);
        redisConnection.off(`title-updated-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false
            , errors: error
        });
    });
    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`title-updated:${messageId}`);
        redisConnection.off(`title-updated-failed:${messageId}`);
        res.status(500).json({
            error: "Timeout error"
        })
    }, 5000);
    redisConnection.emit(`update-playlist-title:${messageId}`, {
        requestId: messageId
        , playlistId: playlistId
        , title: newTitle
    });
});
//REMOVE MOVIE FROM PLAYLIST
router.delete("/delete/:movieId", (req, res) => {
    let movieId = req.params.movieId;
    let userId = req.session.userId;
    console.log("Delete from playlist route: " + movieId);
    console.log("User Id : " + userId);
    // REMOVE IT
    // if(userId === undefined){
    //     userId = "b7cda109-ecf2-4f17-b2ac-3b58e529a850";
    // }
    let redisConnection = req.app.get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;
    redisConnection.on(`removed-movie:${messageId}`, (result, channel) => {
        redisConnection.off(`removed-movie:${messageId}`);
        redisConnection.off(`removed-movie-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        if (result) {
            return res.json({
                success: true
            });
        }
        else {
            return res.json({
                success: false
                , error: error
            });
        }
    });
    redisConnection.on(`removed-movie-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`removed-movie:${messageId}`);
        redisConnection.off(`removed-movie-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false
            , error: error
        });
    });
    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`removed-movie:${messageId}`);
        redisConnection.off(`removed-movie-failed:${messageId}`);
        res.status(500).json({
            error: "Timeout error"
        })
    }, 5000);
    redisConnection.emit(`remove-movie-playlist:${messageId}`, {
        requestId: messageId
        , movieId: movieId
        , userId: userId
    });
});
//ADD MOVIE TO PLAYLIST
router.get("/addmovie/:movieId", (req, res) => {
    let movieId = req.params.movieId;
    //Hardcoded the UserID to add movie to playlist using POSTMAN
    let userId = req.session.userId;
    // Remove it
    // if(userId === undefined){
    //     userId = "b7cda109-ecf2-4f17-b2ac-3b58e529a850";
    // }
    console.log("User ID - " + req.session.userId);
    let redisConnection = req.app.get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;
    redisConnection.on(`added-movie:${messageId}`, (result, channel) => {
        redisConnection.off(`added-movie:${messageId}`);
        redisConnection.off(`added-movie-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        if (result) {
            return res.json({
                success: true
            });
        }
        else {
            return res.json({
                success: false
                , error: error
            });
        }
    });
    redisConnection.on(`added-movie-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`added-movie:${messageId}`);
        redisConnection.off(`added-movie-failed:${messageId}`);
        clearTimeout(killswitchTimeoutId);
        res.json({
            success: false
            , error: error
        });
    });
    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`added-movie:${messageId}`);
        redisConnection.off(`added-movie-failed:${messageId}`);
        res.status(500).json({
            error: "Timeout error"
        })
    }, 5000);
    redisConnection.emit(`add-movie-playlist:${messageId}`, {
        requestId: messageId
        , movieId: movieId
        , userId: userId
    });
});
module.exports = router;