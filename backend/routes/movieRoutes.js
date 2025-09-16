const express = require('express')
const movieController = require('../controllers/MovieController')

const router = express.Router()

router.get('/:id', async (req, res, next) => {
  try {
    await movieController.getMovie(req, res, next)
  } catch(err) {
    return next(err)
  }
})

router.get('/search/:query', async (req, res, next) => {
  try {
    await movieController.search(req, res, next)
  } catch(err) {
    return next(err)
  }
})

module.exports = router