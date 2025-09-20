import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Review } from "../../components/reviewComponents.js"
import MovieCard from "../../components/MovieCard.js"
import "./SingleReview.css"

const SingleReview = () => {
  const [review, setReview] = useState({})
  const [movie, setMovie] = useState({})
  const { id } = useParams()

  useEffect(() => {
    const apiUrl = "http://localhost:3001/api/"
    const getReview = async (setReviewCallback, getMovieCallback) => {
      const response = await fetch(apiUrl+"reviews/"+id)
      const result = await response.json()
      if(response.status === 200) {
        setReviewCallback(result)
        getMovieCallback(result.movie_id, setMovie)
      }
    }
    const getMovie = async (movieId, setMovieCallback) => {
      const response = await fetch(
        apiUrl+"movies/", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ id: movieId })
        }
    )
      const result = await response.json()
      setMovieCallback(result)
    }
    getReview(setReview, getMovie)
  }, [id, setMovie])
  
  return(
    <div className="container" id="single-review-container">
      <h2 class="page-name">Arvostelu elokuvasta</h2>
      <MovieCard title={movie.title} image={movie.poster_url} year={movie.release_year}/>
      <Review text={review.review} rating={review.rating} putRatingBelow={true} />
    </div>
  )
}

export default SingleReview