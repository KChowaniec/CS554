const playlistRoutes = require("./playlist-worker");
const userRoutes = require("./user-worker");
const movieRoutes = require("./movie-worker");
const searchRoutes = require("./search-worker");

let constructorMethod = (app) => {
    app.use("/playlist", recipeRoutes);
    app.use("/user", userRoutes);
    app.use("/movie", movieRoutes);
    app.use("/search", searchRoutes);
    app.use("*", userRoutes); //any other routes
};

module.exports = {
    playlist: playlistRoutes,
    user: userRoutes,
    movie: movieRoutes,
    search: searchRoutes
};