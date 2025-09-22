import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchFilmToReview.css'
import MovieCard from '../../components/MovieCard.js'

const SearchFilmToReview = () => {
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [movies, setMovies] = useState([])

  const onText = (event) => {
    setQuery(event.target.value)
  }

  const onSearch = async (event) => {
    event.preventDefault()
    const response = await fetch("http://localhost:3001/api/movies/search/"+encodeURI(query))
    const result = await response.json()
    // const firstFewMovies =  result.results.slice(0, 5)
    setMovies(result.results)
  }

  const onChoose = (id) => {
    navigate('/reviews/write/'+id)
  }
  
  return(
    <div className="container" id="review-search-container">
      <h2>Valitse elokuva, josta haluat kirjoittaa arvostelun</h2>
      <div id="search-to-review">
        <form onSubmit={onSearch}>
          <input type="text" value={query} onChange={onText} />
          <button type="submit">Hae</button>
        </form>
        <div id="review-search-list">
          {movies.map((movie) => (
            <MovieCard
              title={movie.title}
              image={process.env.REACT_APP_IMG_BASE_URL+movie.poster_path}
              year={movie.release_date.slice(0, 4)}
              onClick={() => onChoose(movie.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchFilmToReview