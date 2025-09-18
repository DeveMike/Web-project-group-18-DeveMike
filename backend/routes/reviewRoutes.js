const express = require('express')
const auth = require('../middleware/auth.js')
const reviewController = require('../controllers/reviewController.js')

const router = express.Router()

/*
router.post('/', auth, async (req, res, next) => {
  try {
    await reviewController.insertReview()
  } catch(err) {
    return next(err)
  }
})
*/

router.post('/', auth, reviewController.insertReview)


module.exports = router