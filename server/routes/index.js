/*Program Title: routes/index.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script routes requests to the appropriate files
*/


var routerUser = require("./user");
var routerMovie = require("./movie");
var routerPlaylist = require("./playlist");
var routerSearch = require("./search");
var routerAnalytics = require("./analytics");
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use("/", routerUser);
    app.use("/movies", routerMovie);
    app.use("/playlist", routerPlaylist);
    app.use("/search", routerSearch);
    app.use("/analyticss", routerAnalytics);
};
