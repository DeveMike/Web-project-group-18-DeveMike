const ReviewModel = require('../models/reviewModel.js');

const ReviewService = {
  async insertReview(userId, body) {
    if (!body) {
      return { status: 400, body: { error: 'body puuttuu' } };
    }
    const tmdbId = body.id;
    const reviewText = body.review;
    const reviewRating = body.rating;

    if (!tmdbId || !reviewText || !reviewRating) {
      return { status: 400, body: { error: 'Jokin puuttuu' } };
    }

    try {
      const movieRows = await ReviewModel.findMovieIdByTmdbId(tmdbId);
      if (movieRows.length === 0) {
        return { status: 404, body: 'Elokuvaa ei löydy' };
      }

      const movieId = movieRows[0].movie_id;
      const insertResult = await ReviewModel.insertReview({
        userId,
        movieId,
        reviewText,
        reviewRating
      });

      if (insertResult.rowCount === 1) {
        return { status: 201, body: { id: insertResult.rows[0].review_id } };
      }
      throw new Error('Insert failed');
    } catch (err) {
      throw err;
    }
  },

  async selectReview(reviewId) {
    if (!reviewId) {
      return { status: 400, body: { error: 'id puuttuu' } };
    }
    try {
      const rows = await ReviewModel.selectReviewById(reviewId);
      if (rows.length === 0) {
        return { status: 404, body: 'Arvostelua ei löydy' };
      }
      return { status: 200, body: rows[0] };
    } catch (err) {
      throw err;
    }
  },

  async selectReviewsForMainPage() {
    try {
      const rows = await ReviewModel.selectReviewsForMainPage();
      return { status: 200, body: rows };
    } catch (err) {
      throw err;
    }
  }
};

module.exports = ReviewService;