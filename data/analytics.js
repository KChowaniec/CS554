mongoCollections = require("./config/mongoCollections");
analytics = mongoCollections.analytics;
var uuid = require('node-uuid');
var https = require("https");
var pathTail = "?api_key=e443ee14fb107feee75db8b448e6a13e";
var restHost = "https://api.themoviedb.org/3";
const fs = require('fs');  //require fs for file methods
var exportedMethods = {
    //get all movies
    getCountByDecade() {
        return analytics().then((statCollection) => {
            return statCollection.aggregate([
                {
                    $group: {
                        _id: {
                            yearRange: "$yearRange"
                        }
                        , count: {
                            "$sum": 1
                        }
                    }
                },
                { $sort: { "_id": 1 } }
            ]).toArray();


        });
    },
    getTopFifteen() {
        return analytics().then((statCollection) => {
            return statCollection.find({}).limit(15).sort({ 'Rank': -1, 'Votes': -1 }).toArray();
        });
    },
    getCountByGenre() {
        return analytics().then((statCollection) => {
            return statCollection.aggregate([
                { $unwind: "$Genre" },
                {
                    $group: {
                        _id: {
                            genre: "$Genre"
                        }
                        , count: {
                            "$sum": 1
                        }
                    }
                },
                { $sort: { "_id": 1 } }
            ]).toArray();
        });
    },
    getTopRev() {
        return analytics().then((statCollection) => {
            return statCollection.find({}).limit(15).sort({ 'Revenue': -1 }).toArray();
        });
    },

    loadRatings() {
        //read in file and insert into collection
        return new Promise((resolve, reject) => {
            return fs.readFile('./topmovie_ratings.json', 'utf-8', function (err, contents) {
                if (err) {
                    reject(err); //reject error to rejection callback
                    return;
                }
                else {
                    var data = JSON.parse(contents);
                    return analytics().then((statCollection) => {
                        return statCollection.insert(data).then(function (result) {
                            resolve(result);
                        }).catch((error) => {
                            reject(error);
                        });
                    });
                }
            });
        });
    }
}
module.exports = exportedMethods;