const ReviewService = require('../services/reviewService.js');

const insertReview = async (req, res, next) => {
  try {
    const { status, body } = await ReviewService.insertReview(req.userId, req.body);
    return res.status(status).json(body);
  } catch (err) {
    return next(err);
  }
};

const selectReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const { status, body } = await ReviewService.selectReview(reviewId);
    return res.status(status).json(body);
  } catch (err) {
    return next(err);
  }
};

const selectReviewsForMainPage = async (req, res, next) => {
  try {
    const { status, body } = await ReviewService.selectReviewsForMainPage();
    return res.status(status).json(body);
  } catch (err) {
    return next(err);
  }
};

module.exports = { insertReview, selectReview, selectReviewsForMainPage };