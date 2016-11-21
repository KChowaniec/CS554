var Showtimes = require('showtimes');
var api;

var exportedMethods = {

setLocation(location) {
api = new Showtimes(location, {});
},

getTheaters(location){
    this.setLocation(location);
    api.getTheaters(function (error, theaters) {
  if (error) {
    throw error;
  }
return theaters;
});
},

getTheater(location, theaterId){
    this.setLocation(location);
api.getTheater(theaterId, function( error, theater) {
  if (error) {
    throw error;
  }
return theater;
});
},

getMovies(location){
    this.setLocation(location);
    api.getMovies(function(error, movies) {
  if (error) {
    throw error;
  }
return movies;
    });
},

getMovie(location, movieId){
        this.setLocation(location);
    api.getMovie(movieId, function(error, movie) {
  if (error) {
    throw error ; 
}
return movie;
    });
}
}


module.exports = exportedMethods; //export methods