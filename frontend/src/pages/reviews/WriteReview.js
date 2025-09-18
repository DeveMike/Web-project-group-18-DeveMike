import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './WriteReview.css'

const apiUrl = "http://localhost:3001/api/"

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

    const onSearch = async (event) => {
      event.preventDefault()
      const response = await fetch(apiUrl+"movies/search/"+encodeURI(query))
      const result = await response.json()
      const firstFewMovies =  result.results.slice(0, 5)
      setMovies(firstFewMovies)
    }

    const onChoose = async (id) => {
      setId(id)
      const response = await fetch(apiUrl+"movies/"+id)
      const dbMovie = await response.json()
      setMovie(dbMovie)
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
                  <button onClick={async () => await onChoose(movie.id)}>Arvostele tämä</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const Writer = () => {
    const [text, setText] = useState("")
    const [score, setScore] = useState(0)
    const [clicked, setClicked] = useState(false)
    const [error, setError] = useState("")

    let sequence = []
    for(let i = 1; i <= 10; i++) {
      sequence.push(i)
    }

    const navigate = useNavigate()

    useEffect(() => {
      const handlePost = async () => {
        if(text && (score > 0)) {
          console.log("fetching")
          const response = await fetch(
            apiUrl+"reviews",
            {
              method: "POST",
              headers:
                {
                  "Content-Type": "application/json",
                  Authorization: "Bearer "+localStorage.getItem('token')
                },
              body: JSON.stringify({ id: id, review: text, score: score })
            }
          )
          const result = await response.json()
          console.log("fetched: "+result)
          if(response.status !== 201) {
            setError("Arvostelun lähettämisessä tapahtui virhe")
          } else {
            const link = "/reviews/"+result.id
            navigate(link)
          }
        } else {
          if(text) {
            setError("Arvosana puuttuu")
          } else if(score > 0) {
            setError("Arvostelu puuttuu")
          } else {
            setError("Arvostelu ja arvosana puuttuvat")
          }
        }
      }

      if(clicked === true) {
        handlePost()
        setClicked(false)
      }
    }, [clicked, score, text, navigate])

    const onText = (event) => {
      setText(event.target.value.trim())
    }

    const onPost = () => {
      setClicked(true)
    }

    const onScore = (event) => {
      setScore(parseInt(event.target.value))
    }

    return(
      <div className="container">
        <h1>Kirjoita arvostelu</h1>
        <div id="review-view">
          <div className="movie" id="reviewMovie">
            <img
              alt="Kuva elokuvan julisteesta."
              src={movie.poster_url}
            />
            <h3 className="title">{ movie.title }</h3>
            <h3 className="release_year">{movie.release_year}</h3>
          </div>
          <div id="review-inputs">
            <textarea placeholder="Kirjoita arvostelu tähän" maxLength={3000} onChange={onText}/>
            <div className="error-score-post">
              <h3>{error}</h3>
              <div className="score">
                {sequence.map((i) => {
                  return(
                    <div className="review-button">
                      <input key={i} id={"radio"+i} type="radio" name="score" value={i} onChange={onScore}/>
                      <label for={"radio"+i}>{i}</label>
                    </div>
                  )
                })}
              </div>
              <button className="post" onClick={onPost}>Lähetä arvostelu</button>
            </div>
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