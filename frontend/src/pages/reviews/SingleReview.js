import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Review } from "../../components/reviewComponents.js"
import MovieCard from "../../components/MovieCard.js"
import "./SingleReview.css"

const SingleReview = () => {
  const [review, setReview] = useState({})
  const { id } = useParams()

  useEffect(() => {
    const apiUrl = "http://localhost:3001/api/"
    const getReview = async (setReviewCallback) => {
      const response = await fetch(apiUrl+"reviews/"+id)
      const result = await response.json()
      if(response.status === 200) {
        setReviewCallback(result)
      }
    }
    getReview(setReview)
  }, [id, setReview])
  
  return(
    <div className="container" id="single-review-container">
      <h2 class="page-name">Arvostelu elokuvasta</h2>
      <MovieCard title={review.title} image={review.poster_url} year={review.release_year}/>
      <Review text={review.review_text} rating={review.rating} full={true} />
    </div>
  )
}

export default SingleReview