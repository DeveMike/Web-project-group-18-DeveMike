import { useState, useEffect } from 'react'
import Search from '../components/Search'
import authService from '../services/api'
import '../styles/Reviews.css'

const Reviews = () => {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(authService.isAuthenticated)
  }, [loggedIn])

  return(
    <div className="container">
      <h1>Arvostelut</h1>
      { loggedIn ? <reviewButton /> : null }
    </div>
  )
}

const reviewButton = () => (
  <button />
)

export default Reviews