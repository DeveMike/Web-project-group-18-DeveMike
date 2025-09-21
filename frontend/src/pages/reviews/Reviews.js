import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import authService from "../../services/api"
import MovieCard from "../../components/MovieCard"
import { Review } from "../../components/reviewComponents"
import "./Reviews.css"

const Reviews = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [reviewsAndMovies, setReviewsAndMovies] = useState([])

  const reviewsFetched = useRef(false)

  useEffect(() => {
    const apiUrl = "http://localhost:3001/api/"

    setLoggedIn(authService.isAuthenticated)

    const addMovies = async (result) => {
      const resultWithMovies = []
      for(const item of result) {
        const movieResponse = await fetch(
          apiUrl+"movies/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ id: item.movie_id })
          }
        )
        const movieResult = await movieResponse.json()
        const itemWithMovie = Object.assign({}, {review: item}, {movie: movieResult} )
        console.log(itemWithMovie)
        resultWithMovies.push(itemWithMovie)
      }
      return resultWithMovies
    }

    const getReviews = async (setReviewsCallback) => {
      if(!reviewsFetched.current) {
        reviewsFetched.current = true
        const response = await fetch(apiUrl+"reviews")
        const result = await response.json()
        const resultWithMovies = await addMovies(result)
        setReviewsCallback(resultWithMovies)
      }
    }

    getReviews(setReviewsAndMovies)
  }, [loggedIn, reviewsFetched, setReviewsAndMovies])

  return(
    <div className="container" id="reviews-list-container">
      <h2>Arvostelut</h2>
      <div id="recent-reviews">
        {reviewsAndMovies.map((item) => (
          <Link to={"/reviews/"+item.review.id}>
            <div className="single-review" key={item.review.id}>
              <MovieCard
                title={item.movie.title}
                image={item.movie.poster_url}
                year={item.movie.release_year}
              />
              <Review text={item.review.review} rating={item.review.rating} />
          </div>
          </Link>
        ))}
      </div>
      { loggedIn ? <ReviewButton /> : null }
    </div>
  )
}

const ReviewButton = () => (
  <div id="review-button">
    <Link to="/reviews/write">
      <button id="review-button">
        Kirjoita arvostelu
      </button>
    </Link>
  </div>
)

export default Reviews