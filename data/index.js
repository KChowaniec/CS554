var form = require("./form");
var users = require("./users");
var playlist = require("./playlist");
var movie = require("./movie");
var api = require("./api");
var analytics = require("./analytics");

module.exports = {
    form: form,
    api: api,
    movie: movie,
    playlist: playlist,
    users: users,
    analytics: analytics
};