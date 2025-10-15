const MovieService = require('../services/movieService.js');

// add
const add = async (req, res, next) => {
  try {
    const bodyId = req.body.id;
    const { status, body } = await MovieService.add(bodyId);
    if (status) return res.status(status).json(body);
    return res.status(500).json({ error: 'Palvelinvirhe' });
  } catch (err) {
    return next(err);
  }
};

// search
const search = async (req, res, next) => {
  try {
    const { status, body } = await MovieService.search(req.params.query);
    return res.status(status).json(body);
  } catch (err) {
    return next(err);
  }
};

// exportataan sama apufunktio, jotta muut osat voivat edelleen vaatia sen tästä reitistä
const { getImgBaseUrl } = MovieService;

module.exports = { add, search, getImgBaseUrl };