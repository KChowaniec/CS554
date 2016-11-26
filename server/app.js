const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const app = express();
var session = require('express-session');
const static = express.static(__dirname + '/public');
const configRoutes = require("./routes");
var flash = require('connect-flash');
const exphbs = require('express-handlebars');
var config = require('../data/all-config.json');
const Handlebars = require('handlebars');
const path = require("path");

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number")
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    },
    partialsDir: ['views/partials/']
});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};

app.set('redis', require("./redis-connection"));
require('./passport')(passport); // pass passport for configuration
app.use("/public", static);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUnitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash());

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

configRoutes(app, passport);
app.use(express.static('./views/static/'));
app.use(express.static('./public/js/bundle/'));


app.listen(config.serverPort, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:" + config.serverPort);

});