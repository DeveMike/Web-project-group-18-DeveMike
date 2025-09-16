const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')

const pool = require('../config/database.js')

class MovieController {
  constructor() {
    this.posterImgDir = path.resolve(__dirname, '../images/posters')

    // create directory on server for poster images if it doesn't yet exist
    if(!fs.existsSync(posterImgDir)) {
      fs.mkdirSync(posterImgDir, { recursive: true })
    }

    this.options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer '+process.env.TMDB_TOKEN
      }
    }
  }  
  
  async getImgBaseUrl() {
    // get base url required for fetching images from tmdb
    const response = await fetch('https://api.themoviedb.org/3/configuration', options)
    const data = await response.json()
    if(response.status === 200) {
      this.imgBaseUrl = data.images.base_url
    } else {
      throw Error("Can't fetch config from TMDB API")
    }
  }

  async addMovieToDb(req, res, next) {
    if(!this.imgBaseUrl) {
      try {
        this.getImgBaseUrl()
      } catch(err) {
        return next(err)
      }
    }

    let dbHasMovie = true
    // check if movie exists in database
    try {
      const result = await pool.query('SELECT * FROM movies WHERE tmdb_id=$1', [id])
      dbHasMovie = (result.rows.length === 0) ? false : true
    } catch(err) {
      return next(err)
    }
    if(dbHasMovie) {
      return res.status(200).json({ message: 'Movie already in database' })
    }

    const id = req.body.tmdb_id
    const movieUrl = 'https://api.themoviedb.org/3/movie/'+id+'?language=fi-FI'
    let data = {}
    let movieFetchStatus = -1
    // get movie from tmdb if it isn't in the database
    try {
      const response = await fetch(movieUrl, this.options)
      data = await response.json()
      movieFetchStatus = response.status
    } catch(err) {
      return next(err)
    }

    let imgName = ''
    // download poster image
    if(movieFetchStatus === 200) {
      imgName = apiData.poster_path
      try {
        const imgUrl = imgBaseUrl+posterSize+imgName
        const response = await fetch(imgUrl)
        if(response.ok && response.body) {
          const file = path.resolve(posterImgDir, '.'+imgName)
          console.log(file)
          let ws = fs.createWriteStream(file)
          Readable.fromWeb(response.body).pipe(ws)
        } else {
          return next(new Error("Couldn't get image"))
        }
      } catch(err) {
        return next(err)
      }
    } else {
      return next(new Error("Couldn't retrieve movie from API"))
    }

    // add movie to database
    let queryResult = {}
    try {
      const queryResult = await pool.query(
        'INSERT INTO movies (tmdb_id, title, description, poster_url, release_year, genre, tmdb_rating)'
        +'VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          apiData.id, apiData.title, apiData.overview, './images/posters'+imgName,
          parseInt(apiData.release_date.slice(0, 4)), apiData.genres[0].name, apiData.vote_average, 
        ]
      )
    } catch(err) {
      return next(err)
    }

    console.log(queryResult)
  }
}