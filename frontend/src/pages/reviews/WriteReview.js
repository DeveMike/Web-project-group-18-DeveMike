import { useState } from 'react'
import axios from 'axios'
import './WriteReview.css'

const WriteReview = () => {
  const [query, setQuery] = useState("")
  const [id, setId] = useState(-1)
  const [movies, setMovies] = useState([])

  const handleChange = (event) => {
    setQuery(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    axios
      .get("http://localhost:3001/api/movies/search/"+encodeURI(query))
      .then((response) => {
        setMovies(response.data.results)
      })
  }

  return(
    <div className="container">
      <h1>Valitse elokuva, josta haluat kirjoittaa arvostelun</h1>
      <div id="search">
        <form onSubmit={ handleSubmit }>
          <input type="text" value={ query } onChange={ handleChange } />
          <button type="submit">Hae</button>
        </form>
        <div id="results">
          <ul>
            { movies.map((movie) => (
              <li key={ movie.id }>{ movie.title }</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default WriteReview