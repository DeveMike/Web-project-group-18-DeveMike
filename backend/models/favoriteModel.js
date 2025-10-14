const pool = require("../config/database");

const FavoriteModel = {
  async getFavoriteListsByUser(userId) {
    const result = await pool.query(
      "SELECT * FROM favorite_lists WHERE user_id = $1",
      [userId]
    );
    return result.rows;
  },

  async insertFavoriteList(userId, list_name) {
    const result = await pool.query(
      `INSERT INTO favorite_lists (user_id, list_name) VALUES ($1, $2) RETURNING *`,
      [userId, list_name]
    );
    return result.rows[0];
  },

  async findMovieByTmdbId(tmdb_id) {
    const result = await pool.query(
      "SELECT * FROM movies WHERE tmdb_id = $1",
      [tmdb_id]
    );
    return result.rows[0] || null;
  },

  async insertMovie({ tmdb_id, title, poster_url, release_year, tmdb_rating }) {
    const result = await pool.query(
      `INSERT INTO movies (tmdb_id, title, poster_url, release_year, tmdb_rating)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tmdb_id, title, poster_url, release_year, tmdb_rating]
    );
    return result.rows[0];
  },

  async addMovieToList(listId, movieId) {
    const result = await pool.query(
      `INSERT INTO favorite_list_movies (list_id, movie_id)
       VALUES ($1, $2)
       ON CONFLICT (list_id, movie_id) DO NOTHING
       RETURNING *`,
      [listId, movieId]
    );
    return result.rows[0] || null;
  },

  async getFavoriteListForUser(listId, userId) {
    const result = await pool.query(
      "SELECT * FROM favorite_lists WHERE list_id = $1 AND user_id = $2",
      [listId, userId]
    );
    return result.rows[0] || null;
  },

  async getMoviesForList(listId) {
    const result = await pool.query(
      `SELECT m.* FROM favorite_list_movies flm
       JOIN movies m ON flm.movie_id = m.movie_id
       WHERE flm.list_id = $1`,
      [listId]
    );
    return result.rows;
  },

  async deleteMovieFromList(listId, movieId) {
    await pool.query(
      "DELETE FROM favorite_list_movies WHERE list_id=$1 AND movie_id=$2",
      [listId, movieId]
    );
  },

  async deleteFavoriteListMovies(listId) {
    await pool.query("DELETE FROM favorite_list_movies WHERE list_id = $1", [listId]);
  },

  async deleteFavoriteList(listId) {
    await pool.query("DELETE FROM favorite_lists WHERE list_id = $1", [listId]);
  },

  async getFavoriteListByShareUrl(shareId) {
    const result = await pool.query(
      "SELECT * FROM favorite_lists WHERE share_url = $1",
      [shareId]
    );
    return result.rows[0] || null;
  },

  async updateFavoriteListShareUrl(listId, shareUrl) {
    await pool.query(
      "UPDATE favorite_lists SET share_url = $1 WHERE list_id = $2",
      [shareUrl, listId]
    );
  }
};

module.exports = FavoriteModel;