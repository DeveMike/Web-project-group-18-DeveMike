const pool = require("../config/database");

// Hae käyttäjän suosikkilistat
exports.getFavoriteLists = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM favorite_lists WHERE user_id = $1",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Virhe getFavoriteLists:", err);
    res.status(500).json({ error: "Tietokantavirhe" });
  }
};

// Luo uusi suosikkilista
exports.createFavoriteList = async (req, res) => {
  try {
    const { list_name } = req.body;
    if (!list_name) return res.status(400).json({ error: "Listan nimi puuttuu" });

    const result = await pool.query(
      `INSERT INTO favorite_lists (user_id, list_name) VALUES ($1, $2) RETURNING *`,
      [req.userId, list_name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Virhe createFavoriteList:", err);
    res.status(500).json({ error: "Palvelinvirhe" });
  }
};

// Lisää elokuva suosikkilistalle
exports.addMovieToList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { tmdb_id, title, poster_url, release_year, tmdb_rating } = req.body;

    let movie = await pool.query("SELECT * FROM movies WHERE tmdb_id = $1", [tmdb_id]);
    if (movie.rows.length === 0) {
      movie = await pool.query(
        `INSERT INTO movies (tmdb_id, title, poster_url, release_year, tmdb_rating)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [tmdb_id, title, poster_url, release_year, tmdb_rating]
      );
    }

    const movieId = movie.rows[0].movie_id;

    const result = await pool.query(
      `INSERT INTO favorite_list_movies (list_id, movie_id)
       VALUES ($1, $2)
       ON CONFLICT (list_id, movie_id) DO NOTHING
       RETURNING *`,
      [listId, movieId]
    );

    res.json(result.rows[0] || { message: "Elokuva oli jo listalla" });
  } catch (err) {
    console.error("Virhe addMovieToList:", err);
    res.status(500).json({ error: "Tietokantavirhe" });
  }
};

// Hae lista + sen elokuvat
exports.getListWithMovies = async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await pool.query(
      "SELECT * FROM favorite_lists WHERE list_id = $1 AND user_id = $2",
      [listId, req.userId]
    );

    if (list.rows.length === 0) {
      return res.status(404).json({ error: "Lista ei löytynyt" });
    }

    const movies = await pool.query(
      `SELECT m.* FROM favorite_list_movies flm
       JOIN movies m ON flm.movie_id = m.movie_id
       WHERE flm.list_id = $1`,
      [listId]
    );

    res.json({ ...list.rows[0], movies: movies.rows });
  } catch (err) {
    console.error("Virhe getListWithMovies:", err);
    res.status(500).json({ error: "Tietokantavirhe" });
  }
};

// Poista elokuva listalta
exports.removeMovieFromList = async (req, res) => {
  try {
    const { listId, movieId } = req.params;

    await pool.query(
      "DELETE FROM favorite_list_movies WHERE list_id=$1 AND movie_id=$2",
      [listId, movieId]
    );

    res.json({ message: "Elokuva poistettu listalta" });
  } catch (err) {
    console.error("Virhe removeMovieFromList:", err);
    res.status(500).json({ error: "Tietokantavirhe" });
  }
};

// Poista suosikkilista ja siihen liittyvät elokuvat
exports.deleteFavoriteList = async (req, res) => {
  try {
    const { listId } = req.params;

    // Varmista, että listan omistaja on oikea käyttäjä
    const list = await pool.query(
      "SELECT * FROM favorite_lists WHERE list_id = $1 AND user_id = $2",
      [listId, req.userId]
    );

    if (list.rows.length === 0) {
      return res.status(404).json({ error: "Lista ei löytynyt tai ei kuulu käyttäjälle" });
    }

    // Poista ensin kaikki elokuvat listalta
    await pool.query("DELETE FROM favorite_list_movies WHERE list_id = $1", [listId]);

    // Poista lopuksi itse lista
    await pool.query("DELETE FROM favorite_lists WHERE list_id = $1", [listId]);

    res.json({ message: "Lista poistettu onnistuneesti" });
  } catch (err) {
    console.error("Virhe deleteFavoriteList:", err);
    res.status(500).json({ error: "Tietokantavirhe listaa poistettaessa" });
  }
};


// Luo tai palauta jaettava linkki
exports.shareFavoriteList = async (req, res) => {
  try {
    const { listId } = req.params;

    // Tarkista että lista on käyttäjän oma
    const list = await pool.query(
      "SELECT * FROM favorite_lists WHERE list_id = $1 AND user_id = $2",
      [listId, req.userId]
    );

    if (list.rows.length === 0) {
      return res.status(404).json({ error: "Lista ei löytynyt tai ei kuulu käyttäjälle" });
    }

    let shareUrl = list.rows[0].share_url;

    if (!shareUrl) {
      const uniqueId = Math.random().toString(36).substring(2, 10);
      shareUrl = uniqueId;

      await pool.query(
        "UPDATE favorite_lists SET share_url = $1 WHERE list_id = $2",
        [shareUrl, listId]
      );
    }

    // Huom! Palautetaan FRONTENDIN osoite
    const fullUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/favorites/shared/${shareUrl}`;
    res.json({ share_url: fullUrl });
  } catch (err) {
    console.error("Virhe shareFavoriteList:", err);
    res.status(500).json({ error: "Virhe linkkiä luodessa" });
  }
};

// Hae jaettu lista ilman kirjautumista
exports.getSharedFavoriteList = async (req, res) => {
  try {
    const { shareId } = req.params;

    const list = await pool.query(
      "SELECT * FROM favorite_lists WHERE share_url = $1",
      [shareId]
    );

    if (list.rows.length === 0) {
      return res.status(404).json({ error: "Jaettua listaa ei löytynyt" });
    }

    const movies = await pool.query(
      `SELECT m.* FROM favorite_list_movies flm
       JOIN movies m ON flm.movie_id = m.movie_id
       WHERE flm.list_id = $1`,
      [list.rows[0].list_id]
    );

    res.json({ ...list.rows[0], movies: movies.rows });
  } catch (err) {
    console.error("Virhe getSharedFavoriteList:", err);
    res.status(500).json({ error: "Virhe jaettua listaa haettaessa" });
  }
};