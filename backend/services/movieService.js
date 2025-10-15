const MovieModel = require('../models/movieModel.js');

const apiUrl = 'https://api.themoviedb.org/3/';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer ' + process.env.TMDB_TOKEN
  }
};

const getImgBaseUrl = async () => {
  try {
    const response = await fetch('https://api.themoviedb.org/3/configuration', options);
    const data = await response.json();
    if (response.status === 200) {
      const imgBaseUrl = data.images.base_url + 'w185';
      return imgBaseUrl;
    } else {
      return Error("Couldn't get image base url");
    }
  } catch (err) {
    return err;
  }
};

const formatResponse = (raw) => {
  const response = {
    id: parseInt(raw.tmdb_id, 10),
    title: raw.title,
    overview: raw.description,
    poster_url: raw.poster_url,
    release_year: raw.release_year,
    genre: raw.genre,
    vote_average: raw.tmdb_rating
  };
  return response;
};

const dbSelect = async (id) => {
// check if movie exists in database
  try {
    const resultRows = await MovieModel.selectByTmdbId(id);
    if (resultRows.length === 0) {
      return null;
    } else {
      return formatResponse(resultRows[0]);
    }
  } catch (err) {
    return err;
  }
};

const MovieService = {
  getImgBaseUrl,
    //add
  async add(bodyId) {
    if (!bodyId) {
      return { status: 400, body: { error: 'body tai id puuttuu' } };
    }

    const checkId = () => {
      if (((typeof bodyId) === 'number') && Number.isInteger(bodyId)) {
        return bodyId.toString(10);
      } else if (((typeof bodyId) === 'string') && parseInt(bodyId, 10)) {
        return bodyId;
      } else {
        return { status: 400, body: { error: 'Huonosti muodostettu id' } };
      }
    };

    const idOrErr = checkId();
    if (idOrErr?.status) return idOrErr;
    const id = idOrErr;
    // get movie from tmdb if it isn't in the database
    const fetchMovie = async () => {
      try {
        const movieUrl = apiUrl + 'movie/' + id + '?language=fi-FI';
        const response = await fetch(movieUrl, options);
        const data = await response.json();
        if (response.status === 200) {
          return data;
        } else {
          return Error("Couldn't fetch movie");
        }
      } catch (err) {
        return err;
      }
    };

    // add movie to database
    const insertMovie = async () => {
      try {
        const data = await fetchMovie();
        if (data instanceof Error) {
          return data;
        }
        const imgBaseUrl = await getImgBaseUrl();
        if (imgBaseUrl instanceof Error) {
          return imgBaseUrl;
        }
        let genreName = undefined;
        if (!data.genres || data.genres.length == 0) {
          genreName = null;
        } else {
          genreName = data.genres[0].name;
        }

        const result = await MovieModel.insertMovie({
          id: data.id,
          title: data.title,
          overview: data.overview,
          poster_url: imgBaseUrl + data.poster_path,
          release_year: parseInt(data.release_date.slice(0, 4)),
          genreName,
          vote_average: data.vote_average
        });

        if (result.rowCount === 1) {
          return formatResponse(result.rows[0]);
        } else {
          return Error("Elokuvaa ei saatu lisättyä tietokantaan");
        }
      } catch (err) {
        return err;
      }
    };

    try {
      const dbData = await dbSelect(id);
      if (dbData) {
        return { status: 200, body: dbData };
      } else {
        const insertData = await insertMovie();
        if (insertData && insertData.title) {
          return { status: 201, body: insertData };
        }
        throw Error("Elokuvaa ei saatu lisättyä");
      }
    } catch (err) {
      throw err;
    }
  },

  //search
  async search(query) {
    try {
      const response = await fetch(
        apiUrl + 'search/movie?query=' + query + '&language=fi-FI',
        options
      );
      const data = await response.json();
      if (response.status === 200) {
        const imgBaseUrl = await getImgBaseUrl();
        return { status: 200, body: { img_base_url: imgBaseUrl, results: data.results } };
      } else if (response.status === 404) {
        return { status: 404, body: { error: "Haulla ei löytynyt elokuvia" } };
      } else {
        throw Error("TMDB-haku ei onnistunut");
      }
    } catch (err) {
      throw err;
    }
  }
};

module.exports = MovieService;