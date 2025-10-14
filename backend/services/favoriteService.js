const FavoriteModel = require("../models/favoriteModel");

const FavoriteService = {
  async getFavoriteLists(userId) {
    try {
      const rows = await FavoriteModel.getFavoriteListsByUser(userId);
      return { status: 200, body: rows };
    } catch (err) {
      console.error("Virhe getFavoriteLists:", err);
      return { status: 500, body: { error: "Tietokantavirhe" } };
    }
  },

  async createFavoriteList(userId, list_name) {
    try {
      if (!list_name) {
        return { status: 400, body: { error: "Listan nimi puuttuu" } };
      }
      const row = await FavoriteModel.insertFavoriteList(userId, list_name);
      return { status: 200, body: row };
    } catch (err) {
      console.error("Virhe createFavoriteList:", err);
      return { status: 500, body: { error: "Palvelinvirhe" } };
    }
  },

  async addMovieToList(listId, payload) {
    try {
      const { tmdb_id, title, poster_url, release_year, tmdb_rating } = payload;

      let movie = await FavoriteModel.findMovieByTmdbId(tmdb_id);
      if (!movie) {
        movie = await FavoriteModel.insertMovie({ tmdb_id, title, poster_url, release_year, tmdb_rating });
      }

      const inserted = await FavoriteModel.addMovieToList(listId, movie.movie_id);
      return { status: 200, body: inserted || { message: "Elokuva oli jo listalla" } };
    } catch (err) {
      console.error("Virhe addMovieToList:", err);
      return { status: 500, body: { error: "Tietokantavirhe" } };
    }
  },

  async getListWithMovies(listId, userId) {
    try {
      const list = await FavoriteModel.getFavoriteListForUser(listId, userId);
      if (!list) {
        return { status: 404, body: { error: "Lista ei löytynyt" } };
      }
      const movies = await FavoriteModel.getMoviesForList(listId);
      return { status: 200, body: { ...list, movies } };
    } catch (err) {
      console.error("Virhe getListWithMovies:", err);
      return { status: 500, body: { error: "Tietokantavirhe" } };
    }
  },

  async removeMovieFromList(listId, movieId) {
    try {
      await FavoriteModel.deleteMovieFromList(listId, movieId);
      return { status: 200, body: { message: "Elokuva poistettu listalta" } };
    } catch (err) {
      console.error("Virhe removeMovieFromList:", err);
      return { status: 500, body: { error: "Tietokantavirhe" } };
    }
  },

  async deleteFavoriteList(listId, userId) {
    try {
      const list = await FavoriteModel.getFavoriteListForUser(listId, userId);
      if (!list) {
        return { status: 404, body: { error: "Lista ei löytynyt tai ei kuulu käyttäjälle" } };
      }
      await FavoriteModel.deleteFavoriteListMovies(listId);
      await FavoriteModel.deleteFavoriteList(listId);
      return { status: 200, body: { message: "Lista poistettu onnistuneesti" } };
    } catch (err) {
      console.error("Virhe deleteFavoriteList:", err);
      return { status: 500, body: { error: "Tietokantavirhe listaa poistettaessa" } };
    }
  },

  async shareFavoriteList(listId, userId, frontendUrlEnv) {
    try {
      const list = await FavoriteModel.getFavoriteListForUser(listId, userId);
      if (!list) {
        return { status: 404, body: { error: "Lista ei löytynyt tai ei kuulu käyttäjälle" } };
      }

      let shareUrl = list.share_url;
      if (!shareUrl) {
        const uniqueId = Math.random().toString(36).substring(2, 10);
        shareUrl = uniqueId;
        await FavoriteModel.updateFavoriteListShareUrl(listId, shareUrl);
      }

      const fullUrl = `${frontendUrlEnv || "http://localhost:3000"}/favorites/shared/${shareUrl}`;
      return { status: 200, body: { share_url: fullUrl } };
    } catch (err) {
      console.error("Virhe shareFavoriteList:", err);
      return { status: 500, body: { error: "Virhe linkkiä luodessa" } };
    }
  },

  async getSharedFavoriteList(shareId) {
    try {
      const list = await FavoriteModel.getFavoriteListByShareUrl(shareId);
      if (!list) {
        return { status: 404, body: { error: "Jaettua listaa ei löytynyt" } };
      }
      const movies = await FavoriteModel.getMoviesForList(list.list_id);
      return { status: 200, body: { ...list, movies } };
    } catch (err) {
      console.error("Virhe getSharedFavoriteList:", err);
      return { status: 500, body: { error: "Virhe jaettua listaa haettaessa" } };
    }
  }
};

module.exports = FavoriteService;