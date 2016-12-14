/*Program Title: routes/movie.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles the /movie routes
*/

var express = require('express');
var data = require("data");
var movies = data.movie;
var uuid = require('node-uuid');
var api = data.api;
var router = express.Router();

// //get all movies
// router.get('/', function (req, res) {
//   	 var list = movies.getAllMovie().then((Movielist) => {
// 		if (Movielist) {
// 			res.status(200).send(Movielist);
// 		} else {
// 			res.sendStatus(404);
// 		}
// 	});
// }),

	//get movie details
	router.get('/detail/:id', function (req, res) {
		let movieId = req.params.id;
		let redisConnection = req
			.app
			.get("redis");
		let messageId = uuid.v4();
		let killswitchTimeoutId = undefined;

		redisConnection.on(`details-retrieved:${messageId}`, (details, channel) => {
			if (details) {
                res.send(JSON.stringify(details));
			}
			redisConnection.off(`details-retrieved:${messageId}`);
			redisConnection.off(`details-retrieved-failed:${messageId}`);

			clearTimeout(killswitchTimeoutId);
		});

		redisConnection.on(`details-retrieved-failed:${messageId}`, (error, channel) => {
			res
				.status(500)
				.json(error);
			redisConnection.off(`details-retrieved:${messageId}`);
			redisConnection.off(`details-retrieved-failed:${messageId}`);

			clearTimeout(killswitchTimeoutId);
		});

		killswitchTimeoutId = setTimeout(() => {
			redisConnection.off(`details-retrieved:${messageId}`);
			redisConnection.off(`details-retrieved-failed:${messageId}`);
			res
				.status(500)
				.json({ error: "Timeout error" })
		}, 5000);

		redisConnection.emit(`get-details:${messageId}`, {
			requestId: messageId,
			movieId: movieId
		});
	});

		//get recommended movies
	router.get('/recommendations/:id', function (req, res) {
		let movieId = req.params.id;
		let redisConnection = req
			.app
			.get("redis");
		let messageId = uuid.v4();
		let killswitchTimeoutId = undefined;

		redisConnection.on(`recommendations-retrieved:${messageId}`, (movies, channel) => {
			if (movies) {
                res.send(JSON.stringify(movies));
			}
			redisConnection.off(`recommendations-retrieved:${messageId}`);
			redisConnection.off(`recommendations-retrieved-failed:${messageId}`);

			clearTimeout(killswitchTimeoutId);
		});

		redisConnection.on(`recommendations-retrieved-failed:${messageId}`, (error, channel) => {
			res
				.status(500)
				.json(error);
			redisConnection.off(`recommendations-retrieved:${messageId}`);
			redisConnection.off(`recommendations-retrieved-failed:${messageId}`);

			clearTimeout(killswitchTimeoutId);
		});

		killswitchTimeoutId = setTimeout(() => {
			redisConnection.off(`recommendations-retrieved:${messageId}`);
			redisConnection.off(`recommendations-retrieved-failed:${messageId}`);
			res
				.status(500)
				.json({ error: "Timeout error" })
		}, 5000);

		redisConnection.emit(`get-recommendations:${messageId}`, {
			requestId: messageId,
			movieId: movieId
		});
	});

	// //add movie
	// router.post('/', function (req, res) {
	// 	var obj = req.body;
	// 	movies.addMovie(obj).then((MovieObj) => {
	// 		if (MovieObj) {
	// 			res.status(200).send(MovieObj);
	// 		} else {
	// 			res.sendStatus(404);
	// 		}
	// 	});
	// }),

	// //update movie
	// router.put('/:id', function (req, res) {
	// 	movies.updateMovieById(req.params.id, req.body).then((MovieObj) => {
	// 		if (MovieObj) {
	// 			res.status(200).send(MovieObj);
	// 		} else {
	// 			res.sendStatus(404);
	// 		}
	// 	});
	// }),

	// //delete movie
	// router.delete('/:id', function (req, res) {
	// 	movies.deleteMovieById(req.params.id).then((MovieObj) => {
	// 		if (MovieObj) {
	// 			res.status(200).send(MovieObj);
	// 		} else {
	// 			res.sendStatus(404);
	// 		}
	// 	});
	// }),

	// //add review to movie
    // router.post('/review/:id', function (req, res) {
	// 	var reviewObj = req.body;
	// 	reviewObj._id = uuid.v4();
	// 	movies.addReviewToMovieGeneral(req.params.id, reviewObj).then((movieObj) => {
	// 		if (movieObj) {
	// 			//console.log(PlaylistObj);
	// 			res.status(200).send(movieObj);
	// 		} else {
	// 			res.sendStatus(404);
	// 		}
	// 	});
	// }),

	// //get reviews for movie
	// router.get('/review/:mid/:rid', function (req, res) {
	// 	movies.getReviewByReviewId(req.params.mid, req.params.rid).then((reviewObj) => {
	// 		if (reviewObj) {
	// 			//console.log(PlaylistObj);
	// 			res.status(200).send(reviewObj);
	// 		} else {
	// 			res.sendStatus(404);
	// 		}
	// 	});
	// }),

	// //delete reviews for movie
	// router.delete('/review/:mid/:rid', function (req, res) {
	// 	movies.removeReviewByReviewId(req.params.mid, req.params.rid).then((movieObj) => {
	// 		if (movieObj) {
	// 			//console.log(PlaylistObj);
	// 			res.status(200).send(movieObj);
	// 		} else {
	// 			res.sendStatus(404);
	// 		}
	// 	});
	// }),

	// //update reviews for movie
	// router.put('/review/:mid/:rid', function (req, res) {
	// 	movies.updateReviewByReviewId(req.params.mid, req.params.rid, req.body).then((reviewObj) => {
	// 		if (reviewObj) {
	// 			res.status(200).send(reviewObj);
	// 		} else {
	// 			res.sendStatus(404);
	// 		}
	// 	});
	// }),


	module.exports = router;
