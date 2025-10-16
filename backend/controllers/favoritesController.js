const FavoriteService = require("../services/favoriteService");

// Hae käyttäjän suosikkilistat
exports.getFavoriteLists = async (req, res) => {
  const { status, body } = await FavoriteService.getFavoriteLists(req.userId);
  return res.status(status).json(body);
};

// Luo uusi suosikkilista
exports.createFavoriteList = async (req, res) => {
  const { status, body } = await FavoriteService.createFavoriteList(req.userId, req.body.list_name);
  return res.status(status).json(body);
};

// Lisää elokuva suosikkilistalle
exports.addMovieToList = async (req, res) => {
  const { listId } = req.params;
  const { status, body } = await FavoriteService.addMovieToList(listId, req.body);
  return res.status(status).json(body);
};

// Hae lista + sen elokuvat
exports.getListWithMovies = async (req, res) => {
  const { listId } = req.params;
  const { status, body } = await FavoriteService.getListWithMovies(listId, req.userId);
  return res.status(status).json(body);
};

// Poista elokuva listalta
exports.removeMovieFromList = async (req, res) => {
  const { listId, movieId } = req.params;
  const { status, body } = await FavoriteService.removeMovieFromList(listId, movieId);
  return res.status(status).json(body);
};

// Poista suosikkilista ja siihen liittyvät elokuvat
exports.deleteFavoriteList = async (req, res) => {
  const { listId } = req.params;
  const { status, body } = await FavoriteService.deleteFavoriteList(listId, req.userId);
  return res.status(status).json(body);
};

// Luo tai palauta jaettava linkki
exports.shareFavoriteList = async (req, res) => {
  const { listId } = req.params;
  const { status, body } = await FavoriteService.shareFavoriteList(
    listId,
    req.userId,
    process.env.FRONTEND_URL
  );
  return res.status(status).json(body);
};

// Hae jaettu lista ilman kirjautumista
exports.getSharedFavoriteList = async (req, res) => {
  const { shareId } = req.params;
  const { status, body } = await FavoriteService.getSharedFavoriteList(shareId);
  return res.status(status).json(body);
};