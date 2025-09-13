import { useState, useEffect } from 'react'
import authService from '../services/api'
import '../styles/Reviews.css'

const Reviews = () => {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(authService.isAuthenticated)
  })
  return(
    <div className="container">
      <h1>Arvostelut</h1>
      { loggedIn ? <Creator /> : null }
    </div>
  )
}

const Creator = () => (
  <div className="box" id="creatorBox">
    <h2>Luo arvostelu</h2>
  </div>
)

export default Reviews