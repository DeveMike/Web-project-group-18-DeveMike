/*
0: success
1: couldn't retrieve movie from API
2: couldn't get image
*/ 

const fs = require('fs')
const { Readable } = require('stream')
const path = require('path')

const pool = require('../config/database.js')

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer '+process.env.TMDB_TOKEN
  }
}

const getImgBaseUrl = async () => {
  try {
    const response = await fetch('https://api.themoviedb.org/3/configuration', options)
    const data = await response.json()
    console.log(data)
    if(response.status === 200) {
      return data.images.base_url
    }
    throw Error("Couldn't retrieve image base URL")
  } catch(err) {
    console.log(err)
    return err
  }
}

const addShawshank = async (imgBaseUrl) => {
  const id = 278
  const posterSize = 'w342'
  const movieUrl = 'https://api.themoviedb.org/3/movie/'+id
  const dataUrl = movieUrl+'?language=fi-FI'
  const imgOptions = {
    method: 'GET',
    headers: {
      accept: 'application/jpg',
      Authorization: 'Bearer '+process.env.TMDB_TOKEN
    }
  }

  let posterImgDir = ''
  let imgName = ''

  let dbData = {}
  let dbHasMovie = true

  let apiData = {}
  let movieFetchStatus = -1

  try {
    posterImgDir = path.resolve(__dirname, '../images/posters')
    if(!fs.existsSync(posterImgDir)) {
      fs.mkdirSync(posterImgDir, { recursive: true })
    }
    console.log(posterImgDir)
  } catch(err) {
    console.error(err)
    return err
  }

  try {
    const result = await pool.query('SELECT * FROM movies WHERE tmdb_id=$1', [id])
    dbData = result.rows[0]
    dbHasMovie = (result.rows.length === 0) ? false : true
  } catch(err) {
    console.error(err)
    return err
  }
  console.log(dbData)

  if(dbHasMovie) {
    console.log('Movie already in database')
    return 0
  }
  console.log('No such movie in DB, trying to add it')
  try {
    const response = await fetch(dataUrl, options)
    apiData = await response.json()
    movieFetchStatus = response.status
  } catch(err) {
    console.error(err)
    return err
  }
  console.log(apiData)

  if(movieFetchStatus === 200) {
    imgName = apiData.poster_path
    let response = {}
    try {
      const imgUrl = imgBaseUrl+posterSize+imgName
      console.log(imgUrl)
      response = await fetch(imgUrl)
      if(response.ok && response.body) {
        const file = path.resolve(posterImgDir, '.'+imgName)
        console.log(file)
        let ws = fs.createWriteStream(file)
        Readable.fromWeb(response.body).pipe(ws)
      } else {
        console.error("Couldn't get image")
        return 2
      }
    } catch(err) {
      console.error(err)
      return err
    }
  } else {
    console.error("Couldn't retrieve movie from API")
    return 1
  }
<<<<<<< HEAD
  
  try {
    const result = await pool.query(
      'INSERT INTO movies (tmdb_id, title, description, poster_url, release_year, genre, tmdb_rating)'
      +'VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        apiData.id, apiData.title, apiData.overview, './images/posters'+imgName,
        parseInt(apiData.release_date.slice(0, 4)), apiData.genres[0].name, apiData.vote_average, 
      ]
    )
    console.log(result)
    return(0)
  } catch(err) {
    console.log(err)
    return(err)
  }
}

=======

  try {
    const result = await pool.query(
      'INSERT INTO movies (tmdb_id, title, description, poster_url, release_year, genre, tmdb_rating)'
      +'VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        apiData.id, apiData.title, apiData.overview, './images/posters'+imgName,
        parseInt(apiData.release_date.slice(0, 4)), apiData.genres[0].name, apiData.vote_average, 
      ]
    )
    console.log(result)
    return(0)
  } catch(err) {
    console.log(err)
    return(err)
  }
}

>>>>>>> 326bf3d (script for adding one movie done)
const run = async () => addShawshank(await getImgBaseUrl())
run()
