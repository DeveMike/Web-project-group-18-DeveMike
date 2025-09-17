const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')

const pool = require('../config/database.js')

class MovieController {
  #imgBaseUrl = undefined

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
    if(!this.#imgBaseUrl) {
      // get base url required for fetching images from tmdb
      try {
        const response = await fetch('https://api.themoviedb.org/3/configuration', this.options)
        const data = await response.json()
        if(response.status === 200) {
          const imgBaseUrl = data.images.base_url
          this.#imgBaseUrl = imgBaseUrl
          return imgBaseUrl
        } else {
          return this.#imgBaseUrl
        }
      } catch(err) {
        return null
      }
    }
  }

  async #dbSelect(id) {
    // check if movie exists in database
    try {
      const result = await pool.query('SELECT * FROM movies WHERE tmdb_id=$1', [id])
      if(result.rows.length === 0) {
        console.log("doesn't exist")
        return undefined
      } else {
        console.log("exists")
        const raw = result.rows[0]
        const response = {
          id: parseInt(raw.tmdb_id, 10),
          title: raw.title,
          overview: raw.description,
          poster_url: raw.poster_url,
          release_year: raw.release_year,
          genre: raw.genre,
          vote_average: raw.tmdb_rating
        }
        return response
      }
    } catch(err) {
      return err
    }
  }

  async getMovie(req, res, next) {
    const id = req.params.id.toString()

    // get movie from tmdb if it isn't in the database
    const fetchMovie = async () => {
      try {
        const movieUrl = this.apiUrl+'movie/'+id+'?language=fi-FI'
        const response = await fetch(movieUrl, this.options)
        const data = await response.json()
        if(response.status === 200) {
          return data
        } else {
          return Error("Couldn't fetch movie")
        }
      } catch(err) {
        return err
      }
    }

    // add movie to database
    const insertMovieOk = async () => {
      try {
        const data = await fetchMovie()
        const imgBaseUrl = await this.#getImgBaseUrl()
        const result = await pool.query(
          'INSERT INTO movies (tmdb_id, title, description, poster_url, release_year, genre, tmdb_rating)'
          +'VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [
            data.id, data.title, data.overview, imgBaseUrl+'w185'+data.poster_path,
            parseInt(data.release_date.slice(0, 4)), data.genres[0].name, data.vote_average, 
          ]
        )
        if(result.rowCount === 1) {
          return true
        } else {
          return Error("Couldn't add movie to database")
        }
      } catch(err) {
        return err
      }
    }

    try {
      const dbData = await this.#dbSelect(id)
      console.log(dbData)
      if(dbData) {
        console.log("sending data to browser")
        return res.status(200).json(dbData)
      }
      if(!dbData) {
        if(await insertMovieOk()) {
          const dbDataAfterInsert = await this.#dbSelect(id)
          if(!dbDataAfterInsert) {
            throw Error("Couldn't add movie to database")
          } else {
            return res.status(200).json(dbDataAfterInsert)
          }
        }
      }
    } catch(err) {
      return next(err)
    }
  }

  async search(req, res, next) {
    try {
      const response = await fetch(
        this.apiUrl+'search/movie?query='+req.params.query+'&language=fi-FI',
        this.options
      )
      const data = await response.json()
      return res.status(200).json(data)
    } catch(err) {
      return next(err)
    }
  }
}

const movieController = new MovieController()

module.exports = movieController