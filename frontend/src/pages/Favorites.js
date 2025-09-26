import { api } from "../services/api";
import React, { useEffect, useState } from "react";
import "../styles/Favorites.css";
import {
  getFavoriteLists,
  createFavoriteList,
  getListWithMovies,
  deleteFavoriteList,
  removeMovieFromList,
} from "../services/favoritesService";
import ShareModal from "../components/ShareModal";

export default function Favorites() {
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [activeListMovies, setActiveListMovies] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [shareUrl, setShareUrl] = useState(null);

  // Lataa listat alussa
  useEffect(() => {
    (async () => {
      try {
        const res = await getFavoriteLists();
        setLists(res.data || []);
        if (res.data?.[0]) {
          setActiveListId(res.data[0].list_id);
        }
      } catch (e) {
        console.error("Suosikkilistojen haku epäonnistui:", e);
      }
    })();
  }, []);

  // Lataa aktiivisen listan elokuvat
  useEffect(() => {
    (async () => {
      if (!activeListId) return;
      try {
        const res = await getListWithMovies(activeListId);
        setActiveListMovies(res.data?.movies || []);
      } catch (e) {
        console.error("Listan elokuvien haku epäonnistui:", e);
      }
    })();
  }, [activeListId]);

  //Luo lista
  const handleCreate = async () => {
    if (!newListName.trim()) return;
    try {
      const res = await createFavoriteList(newListName.trim());
      const newList = res.data;
      setLists((prev) => [newList, ...prev]);
      setActiveListId(newList.list_id);
      setNewListName("");
    } catch (e) {
      console.error("Listan luonti epäonnistui:", e);
      alert("Listan luonti epäonnistui.");
    }
  };

  //Listan poisto
  const handleDeleteList = async (listId) => {
    if (!window.confirm("Haluatko varmasti poistaa tämän listan ja sen elokuvat?")) return;
    try {
      await deleteFavoriteList(listId);
      setLists((prev) => prev.filter((l) => l.list_id !== listId));
      if (activeListId === listId) {
        setActiveListId(null);
        setActiveListMovies([]);
      }
    } catch (e) {
      console.error("Listan poisto epäonnistui:", e);
      alert("Listan poisto epäonnistui.");
    }
  };

  //Elokuvan poisto aktiivisesta listasta
  const handleRemoveMovie = async (movieId) => {
    if (!activeListId) return;
    try {
      await removeMovieFromList(activeListId, movieId);
      setActiveListMovies((prev) => prev.filter((m) => m.movie_id !== movieId));
    } catch (e) {
      console.error("Elokuvan poisto listalta epäonnistui:", e);
      alert("Elokuvan poisto listalta epäonnistui.");
    }
  };

  //Lista
  return (
    <div className="favorites-container">
      <h1>Suosikkilistat</h1>

      <form
        className="create-list-container"
        onSubmit={(e) => {
          e.preventDefault(); // estää sivun refreshin
          handleCreate();
        }}
      >
        <input
          placeholder="Listan nimi"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
        <button type="submit">Luo lista</button>
      </form>

      <div className="lists-container">
        {lists.map((l) => (
          <div key={l.list_id} className="list-item">
            <button
              onClick={() => setActiveListId(l.list_id)}
              className={activeListId === l.list_id ? "list-button active" : "list-button"}
            >
              {l.list_name}
            </button>
            <button
              className="share-list-button"
              aria-label={`Jaa lista ${l.list_name}`}
              onClick={async () => {
                try {
                  const res = await api.post(`/favorites/${l.list_id}/share`);
                  const data = res.data;
                  if (data.share_url) {
                    setShareUrl(data.share_url);
                  } else {
                    throw new Error("Virheellinen vastaus");
                  }
                } catch (e) {
                  console.error("Jakaminen epäonnistui:", e);
                  alert("Listan jakaminen epäonnistui.");
                }
              }}
            >🔗 Jaa</button>
            <button
              className="delete-list-button"
              onClick={() => handleDeleteList(l.list_id)}
              aria-label={`Poista lista ${l.list_name}`}
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      <div className="movies-grid">
        {activeListMovies.length === 0 && (
          <div className="empty-placeholder">
            Tämä lista on tyhjä. Lisää elokuvia haun kautta ⭐
          </div>
        )}
        {activeListMovies.map((m) => (
          <div key={m.movie_id} className="movie-card">
            {m.poster_url ? (
              <img src={m.poster_url} alt={m.title} className="movie-poster" />
            ) : (
              <div className="poster-placeholder" />
            )}
            <div className="movie-title">{m.title}</div>
            <div className="movie-details">
              {m.release_year ?? "N/A"} • {m.tmdb_rating ? `${m.tmdb_rating}/10` : "Ei arvosanaa"}
            </div>
            <button className="remove-movie-button" onClick={() => handleRemoveMovie(m.movie_id)}>
              Poista
            </button>
          </div>
        ))}
      </div>
      {shareUrl && <ShareModal url={shareUrl} onClose={() => setShareUrl(null)} />}
    </div>
  );
}
