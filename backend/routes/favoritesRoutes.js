const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const authenticateToken = require("../middleware/auth");

// Suosikkilistat
router.get("/", authenticateToken, favoritesController.getFavoriteLists);
router.post("/", authenticateToken, favoritesController.createFavoriteList);

// Elokuvat listaan
router.post("/:listId/movies", authenticateToken, favoritesController.addMovieToList);
router.get("/:listId", authenticateToken, favoritesController.getListWithMovies);

//Poisto
router.delete("/:listId", authenticateToken, favoritesController.deleteFavoriteList);
router.delete("/:listId/movies/:movieId", authenticateToken, favoritesController.removeMovieFromList);

//Jaa lista
router.post("/:listId/share", authenticateToken, favoritesController.shareFavoriteList);

//Hae jaettu lista ilman kirjautumista
router.get("/shared/:shareId", favoritesController.getSharedFavoriteList);


module.exports = router;