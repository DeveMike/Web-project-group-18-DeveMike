import { useState, useEffect } from 'react'
import axios from 'axios'
import './WriteReview.css'

const apiUrl = "http://localhost:3001/api/movies/"

const WriteReview = ({tmdbId}) => {
  const [id, setId] = useState(-1)
  const [view, setView] = useState("")
  const [movie, setMovie] = useState({})

  useEffect(() => {
    if(!tmdbId) {
      setView("selectMovie")
    } else {
      setId(tmdbId)
      setView("writeReview")
    }
  }, [tmdbId])

  const Search = () => {
    const [query, setQuery] = useState("")
    const [movies, setMovies] = useState([])

    const onText = (event) => {
      setQuery(event.target.value)
    }

    const onSearch = (event) => {
      event.preventDefault()
      axios
        .get(apiUrl+"search/"+encodeURI(query))
        .then((response) => {
          const firstMovies =  response.data.results.slice(0, 5)
          setMovies(firstMovies)
        })
    }

    const onChoose = (id) => {
      setId(id)
      axios
        .get(apiUrl+id)
        .then((response) => {
          setMovie(response.data)
        })
      setView("writeReview")
    }
    
    return(
      <div className="container">
        <h1>Valitse elokuva, josta haluat kirjoittaa arvostelun</h1>
        <div id="search">
          <form onSubmit={onSearch}>
            <input type="text" value={query} onChange={onText} />
            <button type="submit">Hae</button>
          </form>
          <div id="results">
            <ul>
              {movies.map((movie) => (
                <li key={movie.id}>
                  <div className="movie">
                    <img
                      alt="Kuva elokuvan julisteesta."
                      src={process.env.REACT_APP_IMG_BASE_URL+movie.poster_path}
                    />
                    <h3 className="title">{ movie.title }</h3>
                    <h3 className="release_year">
                      {movie.release_date.slice(0, 4)}
                    </h3>
                  </div>
                  <button onClick={() => onChoose(movie.id)}>Arvostele tämä</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const Writer = () => {
    return(
      <div className="container">
        <h1>Kirjoita arvostelu</h1>
        <div id="review-view">
          <div className="movie">
            <img
              alt="Kuva elokuvan julisteesta."
              src={movie.poster_url}
            />
            <h3 className="title">{ movie.title }</h3>
            <h3 className="release_year">{movie.release_year}</h3>
          </div>
        </div>
      </div>
    )
  }

  const Views = () => {
    if(view === "selectMovie") {
      return(<Search />)
    } else if(view === "writeReview") {
      return(<Writer />)
    } else {
      console.log(id+" "+view)
      return(<h1>a</h1>)
    }
  }

  return(<Views />)
}

export default WriteReview