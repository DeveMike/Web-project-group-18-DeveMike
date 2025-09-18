const express = require('express')
const auth = require('../middleware/auth.js')
const reviewController = require('../controllers/reviewController.js')

const router = express.Router()

router.get('/:id', reviewController.selectReview)

router.post('/', auth, reviewController.insertReview)

module.exports = router