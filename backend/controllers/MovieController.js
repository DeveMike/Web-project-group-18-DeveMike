const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')

const pool = require('../config/database.js')

class MovieController {
  constructor() {
    this.apiUrl = 'https://api.themoviedb.org/3/'

    this.options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer '+process.env.TMDB_TOKEN
      }
    }
  }  
  
  async #getImgBaseUrl() {
    // get base url required for fetching images from tmdb
    const response = await fetch('https://api.themoviedb.org/3/configuration', this.options)
    const data = await response.json()
    if(response.status === 200) {
      this.imgBaseUrl = data.images.base_url
    } else {
      throw Error("Can't fetch config from TMDB API")
    }
  }

  async #checkIfInDb() {
    // check if movie exists in database
    try {
      const result = await pool.query('SELECT * FROM movies WHERE tmdb_id=$1', [id])
      const raw = result.rows[0]
      this.movieData = {
        id: raw.tmdb_id,
        title: raw.title,
        overview: raw.description,
        poster_url: raw.poster_url,
        release_year: raw.release_year,
        genre: raw.genre,
        vote_average: raw.tmdb_rating
      }
      this.dbHasMovie = (result.rows.length === 0) ? false : true
    } catch(err) {
      return err
    }
  }

  async getMovie(req, res, next) {
    if(!this.imgBaseUrl) {
      try {
        this.#getImgBaseUrl()
      } catch(err) {
        return next(err)
      }
    }

    this.#checkIfInDb()
    
    if(this.dbHasMovie) {
      return res.status(200).json(this.movieData)
    }

    const id = req.params.id
    const movieUrl = this.apiUrl+'movie/'+id+'?language=fi-FI'
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

    // add movie to database
    let queryResult = {}
    try {
      const queryResult = await pool.query(
        'INSERT INTO movies (tmdb_id, title, description, poster_url, release_year, genre, tmdb_rating)'
        +'VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          apiData.id, apiData.title, apiData.overview, this.imgBaseUrl+'w185'+apiData.poster_path,
          parseInt(apiData.release_date.slice(0, 4)), apiData.genres[0].name, apiData.vote_average, 
        ]
      )
    } catch(err) {
      return next(err)
    }

    this.#checkIfInDb
    if(!this.dbHasMovie) {
      throw Error("Couldn't add movie to database")
    }
    return res.status(200).json(this.movieData)
  }

  async search(req, res, next) {
    try {
      const response = await fetch(
        this.apiUrl+'search/movie?query='+req.params.query+'&language=fi-FI',
        this.options
      )
      const data = await response.json()
      console.log(data)
      return res.status(200).json(data)
    } catch(err) {
      return next(err)
    }
  }
}

const movieController = new MovieController()

module.exports = movieController