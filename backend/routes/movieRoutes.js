const express = require('express')
const movie = require('../controllers/MovieController.js')

const router = express.Router()

router.post('/', movie.add)

router.get('/search/:query', movie.search)

module.exports = router