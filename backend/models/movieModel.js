const pool = require('../config/database.js');

const MovieModel = {
  async selectByTmdbId(id) {
    const result = await pool.query('SELECT * FROM movies WHERE tmdb_id=$1;', [id]);
    return result.rows;
  },

  async insertMovie({ id, title, overview, poster_url, release_year, genreName, vote_average }) {
  const result = await pool.query(
    `INSERT INTO movies (tmdb_id, title, description, poster_url, release_year, genre, tmdb_rating)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (tmdb_id) DO UPDATE
       SET tmdb_id = EXCLUDED.tmdb_id  -- ei muuta dataa, vain pakottaa RETURNINGin
     RETURNING *;`,
    [ id, title, overview, poster_url, release_year, genreName, vote_average ]
  );
  return result;
}
};

module.exports = MovieModel;