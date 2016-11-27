/*Program Title: tasks/seed.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script is the seed file to populate the movie collection with some initial movies
*/
var dbConnection = require("../config/mongoConnection");
var users = require("../users");
var playlist = require("../playlist");
var movie = require("../movie");
var analytics = require("../analytics");
var theater = require("../theaters");

var https = require("https");
var pathTail = "?api_key=e443ee14fb107feee75db8b448e6a13e";
var restHost = "https://api.themoviedb.org/3";

//also seed people collection (names + ids)
//seed dummy user history?

dbConnection().then(db => {
    return db.dropDatabase().then(() => {
        return dbConnection;
    }).then((db) => {
        var listOfMovie = [];
        new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/popular" + pathTail + "&page=1", (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data).results;
                    fulfill(rs);
                });
            });
        }).then((movieList) => {
            for (var i = 0; i < movieList.length; i++) {
                var newMovie = {};
                newMovie.id = movieList[i].id;
                listOfMovie.push(newMovie);
            }
        }).then(() => {
            for (var i = 0; i < listOfMovie.length; i++) {
                movie.getMovieDetailsById(listOfMovie[i]).then((movieObj) => {
                    //delete movieObj.id;
                    movie.addMovieGeneral(movieObj);
                });
            }
        }).then(() => {
            analytics.loadRatings().then((result) => {
            }).catch((error) => {
                console.log(error);
            });
        }).then(() => {
            // let movies = theater.getTheatersForMovie(10001, "Arrival");
            // console.log(movies);
            console.log("Finished seeding db");
        });
    }).catch((error) => {
        console.log(error);
    });
})