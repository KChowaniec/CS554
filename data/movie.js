
mongoCollections = require("./config/mongoCollections");
movie = mongoCollections.movie;
var uuid = require('node-uuid');

var https = require("https");
var pathTail = "?api_key=e443ee14fb107feee75db8b448e6a13e";
var restHost = "https://api.themoviedb.org/3";

var exportedMethods = {
    //get all movies
    getAllMovie() {
        return movie().then((movieCollection) => {
            return movieCollection.find({}).toArray();
        });
    },
    // get movie by id
    getMovieById(id) {
        return movie().then((movieCollection) => {
            return movieCollection.findOne({ _id: id }).then((movieObj) => {
                return movieObj;
            }).catch((error) => {
                throw error;
            });
        });
    },

    //get movie by original id
    getMovieByOriginId(id) {
        return movie().then((movieCollection) => {
            return movieCollection.findOne({ id: id }).then((movieObj) => {
                return movieObj;
            }).catch((error) => {
                throw error;
            });
        });
    },

    //add movie object
    addMovieGeneral(obj) {
        return movie().then((movieCollection) => {
            obj["_id"] = obj.id;
            var date = new Date(obj.releaseDate);
            // var formatDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
            // obj.releaseDate = formatDate;
            return movieCollection.insertOne(obj).then((movieObj) => {
                return movieObj.insertedId;
            }).then(newId => {
                return this.getMovieById(newId);
            });
        });
    },

    //add movie using specific parameters
    addMovie(movieId) {
        var obj = {
            _id: movieId,
            allReviews: []
        };
        return movie().then((movieCollection) => {
            return movieCollection.insertOne(obj).then((movieObj) => {
                return movieObj.insertedId;
            }).then(newId => {
                return this.getMovieById(newId);
            });
        });
    },

    //delete movie by id
    deleteMovieById(id) {
        return movie().then((movieCollection) => {
            return movieCollection.deleteOne({ _id: id }).then(function (deletionInfo) {
                if (deletionInfo.deletedCount === 0) throw "Could not find the document with this id to delete";
                return true;
            });
        }).catch((error) => {
            return error;
        })
    },

    //update movie by id
    updateMovieById(id, obj) {
        return movie().then((movieCollection) => {
            return movieCollection.update({ _id: id }, { $set: obj }).then(function () {
                return id;
            });
        }).then(id => {
            return this.getMovieById(id);
        }).catch((error) => {
            return error;
        })
    },


    //operations related to review

    addReviewToMovieGeneral(id, obj) {   //add review to the allreviews array by providing movie id and the review object.Note: the review id should be added in the obj first
        return movie().then((movieCollection) => {
            return movieCollection.update({ _id: id }, { $addToSet: { "allReviews": obj } }).then(function () {
                return id;
            }).then(id => {
                return this.getMovieById(id);
            }).catch((error) => {
                return { error: error };
            });
        });
    },

    addReviewToMovie(id,name, date, comment) {   //add review to the allreviews array by providing movie id and the review object.Note: the review id should be added in the obj first
        var reviewId = uuid.v4();
        var obj = {
            _id: reviewId,
            //poster: poster,
            //rating: rating,
            name:name,
            date: date,
            comment: comment
        }
        return movie().then((movieCollection) => {
            return movieCollection.update({ _id: parseInt(id) }, { $set:{"id":parseInt(id)} ,$addToSet: { "allReviews": obj } }, {upsert:true}).then(function () {
                return id;
            }).then(id => {
                return obj;
            }).catch((error) => {
                return { error: error };
            });
        });
    },

    getAllReviews(movieId) {
        return movie().then((movieCollection) => {
            return movieCollection.find({ id: parseInt(movieId) }).toArray().then((res) => {
              if (res.length > 0) {
                return res[0].allReviews;
              } else {
                return {};
              }
                
            });
        });
    },

    getReviewByReviewId(mid, rid) {     //get the review from the movie by providing the specified movie id and the review id
        return movie().then((movieCollection) => {
            return movieCollection.findOne({ _id: mid }).then((movieObj) => {
                if (!movieObj) throw "movie with id " + mid + " doesn't exist!";
                var reviewlist = movieObj.allReviews;
                if (reviewlist) {
                    for (var i = 0; i < reviewlist.length; i++) {
                        if (reviewlist[i]._id == rid) return reviewlist[i];
                    }
                    return "not find";
                }
            }).catch((error) => {
                return { error: error };
            });
        }).catch((error) => {
            return { error: error };
        });

    },

    removeReviewByReviewId(mId, rId) {   //delete specified review in the allReviews array by providing movie id and the review id
        return movie().then((movieCollection) => {
            return movieCollection.update({ _id: mId }, { $pull: { "allReviews": { _id: rId } } }).then(function () {
                return mId;
            }).then(id => {
                return this.getMovieById(id);
            });
        }).catch((error) => {
            return { error: error };
        });
    },

    updateReviewByReviewId(mid, rid, obj) {   //delete specified review in the allReviews array by providing movie id and the review id
        return movie().then((movieCollection) => {
            return movieCollection.update({ _id: mid, allReviews: { $elemMatch: { _id: rid } } }, { $set: { "allReviews.$": obj } }).then(function () {
                return mid;
            }).then((pid) => {
                return this.getReviewByReviewId(mid, rid).then((reviewObj) => {
                    return reviewObj;
                });
            }).catch((error) => {
                return { error: error };
            });
        }).catch((error) => {
            return { error: error };
        });
    },

    //other operations
    //average rating
    updateAverageRating(mid, rating) {
        return movie().then((movieCollection) => {
            return movieCollection.update({ _id: mid }, { $set: { "averageRating": rating } }).then(function () {
                return mid;
            }).then((mid) => {
                return this.getMovieById(mid).then((reviewObj) => {
                    return reviewObj;
                });
            }).catch((error) => {
                return { error: error };
            });
        }).catch((error) => {
            return { error: error };
        });
    },

    //add keywords
    addNewKeywords(id, keyword) {
        return movie().then((movieCollection) => {
            return movieCollection.update({ _id: id }, { $addToSet: { "keywords": keyword } }).then(function () {
                return id;
            }).then(id => {
                return this.getMovieById(id);
            }).catch((error) => {
                return { error: error };
            });
        });
    },

    getMovieByMultiParams(paramObj) {
        var queryStr = "";
        for (var key in paramObj) {
            if (paramObj[key] != null && paramObj[key] != "" && paramObj[key] != undefined) {
                queryStr += "&with_" + key + "=" + paramObj[key];
            }
        }
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/discover/movie" + pathTail + queryStr, (res) => {
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
        });
    },

    //get keywords for movie
    getKeywordsByMovieId(id) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + id + "/keywords" + pathTail, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data).keywords;
                    fulfill(rs);
                });
            });
        });
    },

    //get reviews for movie
    getReviewsByMovieId(id) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + id + "/reviews" + pathTail, (res) => {
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
        });
    },

    //get credits for movie
    getCreditsByMovieId(id) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + id + "/credits" + pathTail, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data);
                    fulfill(rs);
                });
            });
        });
    },

    //get popular movies
    getPopularMovies() {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/popular" + pathTail, (res) => {
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
        });
    },

    //get upcoming movies
    getUpcomingMovies() {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/upcoming" + pathTail, (res) => {
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
        });
    },

    //get details by id
    getMovieDetailsById(movie) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + movie.id + pathTail + "&append_to_response=keywords,credits,release_dates", (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data);

                    movie.title = rs.title;
                    movie.description = rs.overview;
                    movie.releaseDate = rs.release_date;
                    movie.averageRating = rs.vote_average;
                    movie.poster_path = rs.poster_path;
                    movie.allReviews = [];

                    var keywordVal = [];
                    for (var i = 0; i < rs.keywords.keywords.length; i++) {
                        keywordVal.push(rs.keywords.keywords[i].name);
                    }
                    movie.keywords = keywordVal;

                    var genreVal = [];
                    for (var i = 0; i < rs.genres.length; i++) {
                        genreVal.push(rs.genres[i].name);
                    }
                    movie.genre = genreVal;
                    movie.runtime = rs.runtime;

                    var castVal = [];
                    for (var i = 0; i < rs.credits.cast.length; i++) {
                        castVal.push(rs.credits.cast[i].name);
                    }
                    movie.cast = castVal;

                    var crewVal = [];
                    for (var i = 0; i < rs.credits.crew.length; i++) {
                        if (rs.credits.crew[i].job == "Director") {
                            movie.director = rs.credits.crew[i].name;
                        }
                        crewVal.push(rs.credits.crew[i].name);
                    }
                    movie.crew = crewVal;

                    for (var i = 0; i < rs.release_dates.results.length; i++) {
                        if (rs.release_dates.results[i].iso_3166_1 == "US") {
                            movie.rated = rs.release_dates.results[i].release_dates[0].certification;
                        }
                    }

                    fulfill(movie);
                });
            });
        });
    },

    //get all genres
    getAllGenre() {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/genre/movie/list" + pathTail, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });

                res.on('end', () => {
                    var genreArr = [];
                    var rs = JSON.parse(_data).genres;

                    for (var i = 0; i < rs.length; i++) {
                        genreArr.push(rs[i].name);
                    }

                    fulfill(genreArr);
                });
            });
        });
    },

    //get age ratings
    getAllAgeRating() {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/certification/movie/list" + pathTail, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });

                res.on('end', () => {
                    var ageArr = [];
                    var rs = JSON.parse(_data).certifications.US;

                    for (var i = 0; i < rs.length; i++) {
                        ageArr.push(rs[i].certification);
                    }

                    fulfill(ageArr);
                });
            });
        });
    }
}

module.exports = exportedMethods;
