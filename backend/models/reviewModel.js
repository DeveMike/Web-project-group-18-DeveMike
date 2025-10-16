const pool = require('../config/database.js');

const ReviewModel = {
  async findMovieIdByTmdbId(tmdbId) {
    const movieResult = await pool.query('SELECT movie_id FROM movies WHERE tmdb_id=$1;', [tmdbId]);
    return movieResult.rows;
  },

  async insertReview({ userId, movieId, reviewText, reviewRating }) {
    const insertResult = await pool.query(
      'INSERT INTO reviews (user_id, movie_id, review_text, rating) '
      + 'VALUES ($1, $2, $3, $4) '
      + 'RETURNING review_id;',
      [userId, movieId, reviewText, reviewRating]
    );
    return insertResult;
  },

  async selectReviewById(reviewId) {
    const reviewResult = await pool.query(
      'SELECT review_id, review_text, rating, reviews.created_at, tmdb_id, title, poster_url, release_year'
      + ' FROM reviews INNER JOIN movies ON reviews.movie_id=movies.movie_id'
      + ' WHERE review_id=$1;',
      [reviewId]
    );
    return reviewResult.rows;
  },

  async selectReviewsForMainPage() {
    const result = await pool.query(
      'SELECT review_id, review_text, rating, reviews.created_at, tmdb_id, title, poster_url, release_year'
      + ' FROM reviews INNER JOIN movies ON reviews.movie_id=movies.movie_id'
      + ' ORDER BY reviews.created_at DESC LIMIT 30;'
    );
    return result.rows;
  }
};

module.exports = ReviewModel;