/*Program Title: data/history.js
Course: CS554
Date: 11/16/2016
Description:
This module exports methods related to the playlist history collection
*/
mongoCollections = require("../config/mongoCollections");
history = mongoCollections.history;

var exportedMethods = {
    //get all history
    getAllHistory() {
        return history().then((historyCollection) => {
            return historyCollection.find({}).toArray();
        });
    },
    //get history by user id
    getHistoryByUserId(userId) {
        if (!userId) return Promise.reject("User id must be provided");
        return history().then((historyCollection) => {
            return historyCollection.find({ "user_id": userId }).toArray().then((history) => {
                if (!history) throw "User has no history";
                return history;
            }).catch((error) => {
                return error;
            });
        });

    },

    //add history using specific parameters
    addHistory(userId, movieId, genre, rating, keywords, release, review) {
        if (!userId) return Promise.reject("User id must be provided");
        if (!movieId) return Promise.reject("Movie id must be provided");
        if (!genre) return Promise.reject("Genre must be provided");
        if (!rating) return Promise.reject("Rating must be provided");
        if (!keywords) return Promise.reject("Keywords must be provided");
        if (!release) return Promise.reject("Release date must be provided");
        if (!review) return Promise.reject("User rating must be provided");
        return history().then((historyCollection) => {
            let movieObj = {
                _id: movieId,
                genre: genre,
                rated: rating,
                keywords: keywords,
                releaseDate: release,
                user_rating: review
            };
            var timestamp = new Date().toISOString(); //get current date and time
            var obj = {
                _id: timestamp,
                user_id: userId,
                movie: movieObj
            };
            return historyCollection.insertOne(obj).then((historyObj) => {
                return historyObj.insertedId;
            }).then((newId) => {
                return this.getHistoryByUserId(userId);
            });
        });
    },


    //delete history for user
    deleteHistoryByUserId(userId) {
        if (!userId) return Promise.reject("User id must be provided");
        return history().then((historyCollection) => {
            return historyCollection.delete({ "user_id": userId }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) throw "Could not find the user history with this id to delete";
                return true;
            });
        }).catch((error) => {
            return error;
        });
    },

    //update history for user
    updateHistoryByUserId(userId, history) {
        if (!userId) return Promise.reject("User id must be provided");
        if (!history) return Promise.reject("Updated information must be provided");
        return history().then((historyCollection) => {
            return historyCollection.update({ "user_id": userId }, { $set: history }).then(function () {
                return id;
            }).then(id => {
                return this.getHistoryByUserId(userId);
            }).catch((error) => {
                return error;
            });
        });
    }
}

module.exports = exportedMethods;