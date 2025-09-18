import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { DbMovie, Review } from "./reviewComponents"
import "./SingleReview.css"

const SingleReview = () => {
  const [review, setReview] = useState({})
  const [movie, setMovie] = useState({})
  const { id } = useParams()
  const apiUrl = "http://localhost:3001/api/"

  useEffect(() => {
    const getReview = async (setReviewCallback, getMovieCallback) => {
      const response = await fetch(apiUrl+"reviews/"+id)
      const result = await response.json()
      if(response.status === 200) {
        setReviewCallback(result)
        getMovieCallback(result.movie_id, setMovie)
      }
    }
    const getMovie = async (movieId, setMovieCallback) => {
      const response = await fetch(apiUrl+"movies/"+movieId)
      const result = await response.json()
      setMovieCallback(result)
    }
    getReview(setReview, getMovie)
  }, [id, apiUrl, setMovie])
  
  return(
    <div className="container">
      <DbMovie movie={movie} />
      <Review review={review} />
    </div>
  )
}

export default SingleReview