var Showtimes = require('showtimes');
var api;

var exportedMethods = {

  setLocation(location) {
    api = new Showtimes(location, { });
  },

  getTheatersForLocation() {
    console.log(api);
    api.getTheaters(function (error, theaters) {
      if (error) {
        console.log(error);
        throw error;
      }
      console.log(theaters);
    return theaters;
    });
  },

  getTheater(theaterId) {
  return api.getTheater(theaterId, function (error, theater) {
      if (error) {
        throw error;
      }
      return theater;
    });
  },

  getMovies() {
    return api.getMovies(function (error, movies) {
      if (error) {
        throw error;
      }
      return movies;
    });
  },

  getMovie(movieId) {
    return api.getMovie(movieId, function (error, movie) {
      if (error) {
        throw error;
      }
      return movie;
    });
  },

  getTheatersForMovie(location, movieName){
    this.setLocation(location);
    theatersAtLocation = this.getTheatersForLocation();
    //console.log(theaters);
    let theatersShowingMovie = [];
    for(var i =0; i < theatersAtLocation.length; i++){
      if(theatersAtLocation[i].movies.contains(movieName)){
        theatersShowingMovie.push(theatersAtLocation[i]);
      }
    }
    return theatersShowingMovie;
  }
}


module.exports = exportedMethods; //export methods