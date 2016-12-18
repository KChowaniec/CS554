/*Program Title: routes/search.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles all /search routes
*/
var express = require('express');
var router = express.Router();
var data = require("data");
var form = data.form;
var api = data.api;
var user = data.users;
var url = require('url');
var xss = require('xss');
const uuid = require("node-uuid");


router.get("/preferences", (req, res) => {

    //get user preferences (if any)
    var userId = req.session.userId;
    var redisConnection = req
        .app
        .get("redis");
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;


    redisConnection.on(`preferences-retrieved:${messageId}`, (preferences, channel) => {
        redisConnection.off(`preferences-retrieved:${messageId}`);
        redisConnection.off(`preferences-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

        if (Object.keys(preferences).length > 0) { //preferences defined
            return res.json({ success: true, preferences: preferences });
        }
    });

    redisConnection.on(`preferences-retrieved-failed:${messageId}`, (error, channel) => {

        redisConnection.off(`preferences-retrieved:${messageId}`);
        redisConnection.off(`preferences-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`preferences-retrieved:${messageId}`);
        redisConnection.off(`preferences-retrieved-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`get-preferences:${messageId}`, {
        requestId: messageId,
        userId: userId
    });
});

//post search criteria
router.get("/", (req, res) => {

    var title = req.query.title ? req.query.title : "";

    //console.log('Body : ' + JSON.stringify(req.body));
    //console.log('Title : ' + title);
    var parseActors = req.query.actor ? [req.query.actor.split(',')] : "";
    //console.log('Actor : ' + parseActors);
    
    var parseGenre = req.query.genre ? [req.query.genre.split(',')] : "";
    //console.log('genre : ' + parseGenre);
    
    var parseCrew = req.query.crew ? req.query.crew : "";
    //console.log('Crew : ' + parseCrew);
    
    var rating = req.query.rating ? req.query.rating : "";
    //console.log('Rating : ' + rating);
    
    var evaluation = req.query.evaluation ? req.query.evaluation : "";
    //console.log('Evaluation : ' + evaluation);
    
    var year = req.query.releaseYear ? req.query.releaseYear : "";
    //console.log('Year : ' + year);
    
    var parseWords = req.query.keywords ? [req.query.keywords.split(',')] : "";
    //console.log('keywords : ' + parseWords);
    
    var queryData = {
        title: title,
        actors: parseActors,
        genre: parseGenre,
        crew: parseCrew,
        rating: rating,
        evaluation: evaluation,
        year: year,
        keywords: parseWords
    };
    var redisConnection = req
        .app
        .get("redis");
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;


    redisConnection.on(`query-created:${messageId}`, (queryString, channel) => {
        console.log('@get search query : query-created ');
        console.log('Query String : ' + queryString);
        redisConnection.off(`query-created:${messageId}`);
        redisConnection.off(`query-created-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        if (queryString) {
            return res.json({ success: true, query: queryString });
        }
        else {
            return res.json({ success: false, error: error });
        }
    });

    redisConnection.on(`query-created-failed:${messageId}`, (error, channel) => {
        console.log('@get search query : query-created-failed ' + JSON.stringify(error));

        redisConnection.off(`query-created:${messageId}`);
        redisConnection.off(`query-created-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({ success: false, error: error });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`query-created:${messageId}`);
        redisConnection.off(`query-created-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);
    console.log('Redirecting to create-query @ search module fir message with id : ' + messageId);
    redisConnection.emit(`create-query:${messageId}`, {
        requestId: messageId,
        query: queryData,
        title: title
    });
});

//call search methods using criteria passed in
router.get("/results/:pageId*", (req, res) => {
    console.log('------------- @/results/:pageId -------------');

    var page = req.params.pageId;
    console.log('page id : ' + page);
    var queryString = "";
    var title = req.query.title ? req.query.title : "";
    //console.log('title in Query String : ' + req.query.title);
    if (req.query.title) {
        queryString = req.query.title ? ("title=" + req.query.title) : "";
        //console.log('Query String : ' + queryString);
    } else {
        var queryData = (url.parse(xss(req.url), true).query);
        console.log('Query String : ' + JSON.stringify(queryData));

        //determine search criteria string
        Object.keys(queryData).forEach(function (key, index) {
            if (key == "title") {
                //title = queryData[key];
            }
            else {
                queryString = queryString + "&" + key + "=" + queryData[key];
            }
        });
        console.log(' *************************** ');
        console.log(' Query String : ' + queryString);
        console.log(' *************************** ');
    }



    
    var redisConnection = req
        .app
        .get("redis");
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;


    redisConnection.on(`movies-retrieved:${messageId}`, (results, channel) => {

        console.log('@movies-retrieved with results : ' + results.movielist);

        redisConnection.off(`movies-retrieved:${messageId}`);
        redisConnection.off(`movies-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);


        if (results) {

            return res.json(
                    { 
                        success: true, 
                        page: results.pages, 
                        movies: results.movielist, 
                        total: results.total 
                    });
        }
    });

    redisConnection.on(`movies-retrieved-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`movies-retrieved:${messageId}`);
        redisConnection.off(`movies-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`movies-retrieved:${messageId}`);
        redisConnection.off(`movies-retrieved-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`search-movies:${messageId}`, {
        requestId: messageId,
        title: title,
        page: page,
        queryString: queryString
    });

});


//get keywords
router.get("/keywords", (req, res) => {
    var keyword = xss(req.query.value);
    var redisConnection = req
        .app
        .get("redis");
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;

    redisConnection.on(`keyword-retrieved:${messageId}`, (result, channel) => {

        redisConnection.off(`keyword-retrieved:${messageId}`);
        redisConnection.off(`keyword-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        if (result) {
            return res.json({ success: true, results: result });
        }
        else {
            return res.json({ success: false, message: "Keywords not found" });
        }
    });

    redisConnection.on(`keyword-retrieved-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`keyword-retrieved:${messageId}`);
        redisConnection.off(`keyword-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`keyword-retrieved:${messageId}`);
        redisConnection.off(`keyword-retrieved-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`get-keyword:${messageId}`, {
        requestId: messageId,
        keyword: keyword
    });
});

//get person
router.get("/person", (req, res) => {
    var person = xss(req.query.value);
    var redisConnection = req
        .app
        .get("redis");
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;

    redisConnection.on(`person-retrieved:${messageId}`, (result, channel) => {
        redisConnection.off(`person-retrieved:${messageId}`);
        redisConnection.off(`person-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

        if (result) {
            return res.json({ success: true, results: result });
        }
        else {
            return res.json({ success: false, message: "Person not found" });
        }
    });

    redisConnection.on(`person-retrieved-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`person-retrieved:${messageId}`);
        redisConnection.off(`person-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`person-retrieved:${messageId}`);
        redisConnection.off(`person-retrieved-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`get-person:${messageId}`, {
        requestId: messageId,
        person: person
    });
});


//get theaters playing a movie
// router.get("/theaters/:movieId", (req, res) => {
// });

module.exports = router;
