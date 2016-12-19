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
router.post("/", (req, res) => {
  
    

    
    // console.log(' *************************************** ');
    // console.log('getting query string');
    // var title = req.query.title ? req.query.title : "";
    // console.log('Title : ' + title);

    // var parseActors = req.query.actor ? [req.query.actor.split(',')] : "";
    // console.log('Actor : ' + parseActors);
    
    // var parseGenre = req.query.genre ? [req.query.genre.split(',')] : "";
    // console.log('genre : ' + parseGenre);
    
    // var parseCrew = req.query.crew ? req.query.crew.split(',') : "";
    // console.log('Crew : ' + parseCrew);
    // //var crews = req.query.crew ? req.query.crew.split(',') : '';
    
    
    // var rating = req.query.rating ? req.query.rating : "";
    // console.log('Rating : ' + rating);
    
    // var evaluation = req.query.evaluation ? req.query.evaluation : "";
    // console.log('Evaluation : ' + evaluation);
    
    // var year = req.query.releaseYear ? req.query.releaseYear : "";
    // console.log('Year : ' + year);
    
    // var parseWords = req.query.keywords ? req.query.keywords.split(',') : "";
    // console.log('keywords : ' + parseWords);
      
    var title = req.body.title;
    var parseActors = req.body.parseActors;
    var parseGenre = req.body.parseGenre;
    var parseCrew = req.body.parseCrew;
    var year = req.body.year;
    var parseWords = req.body.parseWords;
    console.log('Year Filter : ' + year);
    var queryData = {
        title: title,
        actors: parseActors,
        genre: parseGenre,
        crew: parseCrew,
        rating: '',
        evaluation: '',
        year: year,
        keywords: parseWords
    };
    console.log()
    var redisConnection = req
        .app
        .get("redis");
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;


    redisConnection.on(`query-created:${messageId}`, (queryString, channel) => {
        //console.log('@get search query : query-created ');
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
    console.log('Redirecting worker : ' + messageId);
    redisConnection.emit(`create-query:${messageId}`, {
        requestId: messageId,
        query: queryData,
        title: title
    });
});

//call search methods using criteria passed in
router.get("/results/:pageId*", (req, res) => {
    console.log(' *************************************** ');
    console.log(' Getting query results ');
    console.log(' Query from client : ' + JSON.stringify(req.query) );
    var page = req.params.pageId;
    //console.log('page id : ' + page);
    var queryString = "";
    var title = req.query.title ? req.query.title : "";
    //console.log('title in Query String : ' + req.query.title);
    if (req.query.title) {
        queryString = req.query.title ? ("title=" + req.query.title) : "";
        //console.log('Query String : ' + queryString);
    } else {
        // console.log('Query : ' + JSON.stringify(req.query));
        // console.log('Query : ' + JSON.stringify(req.query.with_genres));
        
        // queryString += req.query.with_cast ? ("with_cast=" + req.query.with_cast + '&') : "";
        // queryString += req.query.director ? ("director=" + req.query.director + '&') : "";
        // console.log(' *********************************** Genre : ' + req.query.genre );
        // queryString += req.query.with_genres ? ("with_genres=" + req.query.with_genres + '&') : "";
        // queryString += req.query.keywords ? ("keywords=" + req.query.keywords + '&') : "";
        // queryString += req.query.crew ? ("crew=" + req.query.crew + '&') : "";
        
        // queryString += req.query["primary_release_date.lte"] ? ("primary_release_date.lte=" + req.query["primary_release_date.lte"] + '&') : "";

        // queryString += req.query.sort_by ? ("sort_by=" + req.query.sort_by + '&') : "";
        // queryString = queryString.charAt(queryString.length-1) == '&' ? queryString.substr(0,queryString.length-1) : queryString;
        
        // if(req.query.director)
        //     queryString = req.query.title ? ("director=" + req.query.director + '&') : "";

        // var queryData = (url.parse(xss(req.url), true).query);
        // console.log('Query String : ' + JSON.stringify(queryData));

        //determine search criteria string

        var queryData = req.query
        Object.keys(queryData).forEach(function (key, index) {
            queryString = queryString + "&" + key + "=" + queryData[key].split(',');
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
        var count = results.movielist ?  results.movielist.length : 0;
        console.log('@movies-retrieved with results : ' + count );
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
