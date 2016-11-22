/*Program Title: data/movie.js
Course: CS546-WS
Date: 08/18/2016
Description:
This module exports methods related to the movie collection
*/
mongoCollections = require("./config/mongoCollections");
analytics = mongoCollections.analytics;
var uuid = require('node-uuid');
var https = require("https");
var pathTail = "?api_key=e443ee14fb107feee75db8b448e6a13e";
var restHost = "https://api.themoviedb.org/3";
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
                }
      ]).toArray();
        
        
        });
    }
}
module.exports = exportedMethods;