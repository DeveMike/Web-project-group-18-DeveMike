import React, { useState } from "react";
import axios from "axios";
import "../styles/Search.css";

const GENRES = [
  { id: 28, name: "Toiminta" },
  { id: 18, name: "Draama" },
  { id: 35, name: "Komedia" },
  { id: 27, name: "Kauhu" },
  { id: 878, name: "Scifi" },
];

const YEARS = ["2025", "2024", "2023", "2022", "2021"];

export default function Search() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  const handleAddFavorite = (movie) => {
    // myöhemmin tähän axios POST backendille
    console.log("Lisätään suosikkeihin:", movie);
    alert(movie.title + " lisättiin suosikkeihin!");
  };

  //TMDB Haku
  const handleSearch = async () => {
    setLoading(true);

    try {
      const apiKey = process.env.REACT_APP_TMDB_KEY;
      let endpoint = "";

      if (query) {
        // Jos käyttäjä kirjoittaa nimen, käytetään search/movie
        endpoint = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=fi-FI&query=${encodeURIComponent(
          query
        )}`;
        if (year) {
          endpoint += `&year=${year}`;
        }
        // HUOM: with_genres ei toimi searchissa
      } else {
        // Jos ei nimeä -> käytetään discover/movie
        endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fi-FI`;
        if (genre) {
          endpoint += `&with_genres=${genre}`;
        }
        if (year) {
          endpoint += `&primary_release_year=${year}`;
        }
      }

      const res = await axios.get(endpoint);
      if (res.data && res.data.results) {
        setResults(res.data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Virhe TMDB-haussa:", err);
    } finally {
      setLoading(false);
    }
  };
    
  //UI
  return (
    <div className="search-container">
      <h2>🎬 Elokuvahaku</h2>

      <div className="search-row">
        <input
          type="text"
          placeholder="Kirjoita nimi..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Valitse genre</option>
          {GENRES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Valitse vuosi</option>
          {YEARS.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <button onClick={handleSearch}>Hae</button>
      </div>

      {loading && <p>Ladataan…</p>}

      <div className="results-grid">
        {results.map((m) => (
          <div key={m.id} className="result-card">
            {m.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
                alt={m.title}
              />
            ) : (
              <div className="poster-placeholder">Ei kuvaa</div>
            )}
            <h4>{m.title}</h4>
            <p>
              {m.release_date?.slice(0, 4) || "N/A"} •{" "}
              {m.vote_average
                ? m.vote_average.toFixed(1) + "/10"
                : "Ei arvosanaa"}
            </p>
            {isLoggedIn && (
              <button
                className="favorite-btn"
                onClick={() => handleAddFavorite(m)}>
                ⭐ Lisää suosikkeihin
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
