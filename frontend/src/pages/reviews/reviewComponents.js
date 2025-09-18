const DbMovie = ({movie}) => {
  return(
    <div className="db-movie" id={"db-movie-"+movie.id}>
      <img
        alt="Kuva elokuvan julisteesta."
        src={movie.poster_url}
      />
      <div>
        <h2 className="title">{ movie.title }</h2>
        <h3 className="release_year">{movie.release_year}</h3>
      </div>
    </div>
  )
}

const Review = ({review}) => {
  return(
    <div className="review" id={"review-"+review.id}>
      <p>{review.review}</p>
    </div>
  )
}

export { DbMovie, Review }