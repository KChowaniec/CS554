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
    let userId = req.session.userId;
    let redisConnection = req
        .app
        .get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;


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
router.post("/", (req, res) => {
    console.log(req.body);
    let title = xss(req.body.title);
    let parseActors = xss(req.body.parseActors);
    let parseGenre = xss(req.body.parseGenre);
    let parseCrew = xss(req.body.parseCrew);
    let rating = xss(req.body.rating);
    let evaluation = xss(req.body.evaluation);
    let year = xss(req.body.releaseYear);
    let parseWords = xss(req.body.parseWords);
    console.log(parseActors);
    let queryData = {
        title: title,
        actors: parseActors,
        genre: parseGenre,
        crew: parseCrew,
        rating: rating,
        evaluation: evaluation,
        year: year,
        keywords: parseWords
    };
    let redisConnection = req
        .app
        .get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;


    redisConnection.on(`query-created:${messageId}`, (queryString, channel) => {

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
        redisConnection.off(`query-created:${messageId}`);
        redisConnection.off(`query-created-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
        return res.json({
            success: false,
            errors: error
        });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`query-created:${messageId}`);
        redisConnection.off(`query-created-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`create-query:${messageId}`, {
        requestId: messageId,
        query: queryData,
        title: title
    });
});

//call search methods using criteria passed in
router.get("/results/:pageId", (req, res) => {
    let page = req.params.pageId;
    let queryData = (url.parse(xss(req.url), true).query);
    let queryString = "";
    let title;
    //determine search criteria string
    Object.keys(queryData).forEach(function (key, index) {
        if (key == "title") {
            title = queryData[key];
        }
        else {
            queryString = queryString + "&" + key + "=" + queryData[key];
        }
    });
    let redisConnection = req
        .app
        .get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;


    redisConnection.on(`movies-retrieved:${messageId}`, (results, channel) => {
        redisConnection.off(`movies-retrieved:${messageId}`);
        redisConnection.off(`movies-retrieved-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

        if (results) {
            return res.json({ success: true, results: results });
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
    let keyword = xss(req.query.value);
    let redisConnection = req
        .app
        .get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;

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
    let person = xss(req.query.value);
    let redisConnection = req
        .app
        .get("redis");
    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;

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