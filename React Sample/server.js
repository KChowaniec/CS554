var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
// We create our express isntance:
var app = express();
app.use("/assets", express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", function(req, res) {
    return res.render("matrix-home");;
});

app.get("/getbanner", function(req, res) {
    var _data = fs.readFileSync(__dirname + "/public/images/Coldplay Wallpaper.jpg");
    res.send(_data);
});

app.get('/test', function(req, res) {

});

app.get("/searchMovies", function(req, res) {
    try {
        var movie_name = req.query.movie;
        var actor = req.query.actor;
        var director = req.query.director;
        var genre = req.query.genre;
        var year = req.query.year;

        var _data = fs.readFileSync(__dirname + "/public/movie-data.json");
        var movie_arr = JSON.parse(_data);

        if (movie_name) {
            movie_arr = movie_arr.filter(x => { return x.movie.toLowerCase() == movie_name.toLowerCase() });
        }
        if (actor) {
            movie_arr = movie_arr.filter(x => { return x.actor.toLowerCase() == actor.toLowerCase() });
        }
        if (director) {
            movie_arr = movie_arr.filter(x => { return x.director.toLowerCase() == director.toLowerCase() });
        }
        if (genre) {
            movie_arr = movie_arr.filter(x => { return x.genre.toLowerCase() == genre.toLowerCase() });
        }
        if (year) {
            movie_arr = movie_arr.filter(x => { return x.year.toLowerCase() == year.toLowerCase() });
        }

        res.json(movie_arr);
    } catch (e) {
        console.error('error : ' + e);
        return res.json({ 'error': e });
    }
});

app.get("/getpl", function(req, res) {

    try {
        var _data = fs.readFileSync(__dirname + "/public/date.json");
        var json_playlist = JSON.parse(_data);
        return res.json(json_playlist);
    } catch (e) {
        console.error('error : ' + e);
        return res.json({ 'error': e });
    }

});

app.listen(3000, function() {
    console.log('Your server is now listening on port 3000! Navigate to http://localhost:3000 to access it');
});