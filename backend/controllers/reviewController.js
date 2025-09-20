const pool = require('../config/database.js')

const formatReceivedReview = async (raw) => {
  const movieResult = await pool.query('SELECT tmdb_id FROM movies WHERE movie_id=$1;', [raw.movie_id])
  formattedReview = {
    id: raw.review_id,
    movie_id: movieResult.rows[0].tmdb_id,
    review: raw.review_text,
    rating: raw.rating,
    created_at: raw.created_at,
    updated_at: raw.updated_at
  }
  return formattedReview
}

const insertReview = async (req, res, next) => {
  if(!req.body) {
    res.status(400).json({ error: 'body puuttuu'})
  } else {
    const tmdbId = req.body.id
    const reviewText = req.body.review
    const reviewRating = req.body.rating

    if(!tmdbId || !reviewText || !reviewRating) {
      return res.status(400).json({ error: 'Jokin puuttuu'})
    } else {
      try {
        const movieResult = await pool.query('SELECT movie_id FROM movies WHERE tmdb_id=$1', [tmdbId])
        if(movieResult.rows.length === 0) {
          return res.status(404).json('Elokuvaa ei löydy')
        } else {
          const movieId = movieResult.rows[0].movie_id
          const insertResult = await pool.query(
            'INSERT INTO reviews (user_id, movie_id, review_text, rating) '
            +'VALUES ($1, $2, $3, $4) '
            +'RETURNING review_id;',
            [req.userId, movieId, reviewText, reviewRating]
          )
          if(insertResult.rowCount === 1) {
            return res.status(201).json({ id: insertResult.rows[0].review_id })
          }
        }
      } catch(err) {
        return next(err)
      }
    }
  }
}

const selectReview = async (req, res, next) => {
  const reviewId = req.params.id
  if(!reviewId) {
    return res.status(400).json({ error: "id puuttuu" })
  } else {
    try {
      const reviewResult = await pool.query('SELECT * FROM reviews WHERE review_id=$1;', [reviewId])
      if(reviewResult.rows.length === 0) {
        return res.status(404).json("Arvostelua ei löydy")
      } else {
        const raw = reviewResult.rows[0]
        const reviewJson = await formatReceivedReview(raw)
        return res.status(200).json(reviewJson)
      }
    } catch(err) {
      return next(err)
    }
  }
}

const selectReviewsForMainPage = async (req, res, next) => {
  try {
    result = pool.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 5')
    const formattedArray = []
    for(item in result.rows) {
      const formatted = await formatReceivedReview(item)
      formattedArray.push(formatted)
    }
    return formattedArray
  } catch(err) {
    return next(err)
  }
}

module.exports = { insertReview, selectReview, selectReviewsForMainPage }