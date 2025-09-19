import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import authService from '../../services/api'
import './Reviews.css'

const Reviews = () => {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(authService.isAuthenticated)
  }, [loggedIn])

  return(
    <div className="container">
      <h2>Arvostelut</h2>
      { loggedIn ? <ReviewButton /> : null }
    </div>
  )
}

const ReviewButton = () => (
  <div className="container" id="review-button-container">
    <Link to="/reviews/write">
      <button>
        Kirjoita arvostelu
      </button>
    </Link>
  </div>
)

export default Reviews