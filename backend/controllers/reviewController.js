const pool = require('../config/database.js')

const insertReview = async (req, res, next) => {
  console.log(req.body)
  if(!req.body) {
    res.status(400).json({ error: 'body puuttuu'})
  } else {
    const tmdbId = req.body.id
    const reviewText = req.body.review
    const reviewScore = req.body.score

    if(!tmdbId || !reviewText || !reviewScore) {
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
            [req.userId, movieId, reviewText, reviewScore]
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

module.exports = { insertReview }