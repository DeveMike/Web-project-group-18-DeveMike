import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import "../styles/Favorites.css";

export default function FavoritesShared() {
    const { shareId } = useParams();
    const [list, setList] = useState(null);

    useEffect(() => {
        api.get(`/favorites/shared/${shareId}`)
            .then(res => setList(res.data))
            .catch(err => console.error("Virhe jaettua listaa haettaessa:", err));
    }, [shareId]);

    if (!list) return <p>Ladataan jaettua listaa...</p>;

    return (
        <div className="favorites-container">
            <h1>Jaettu lista: {list.list_name}</h1>
            <div className="movies-grid">
                {list.movies.map((m) => (
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
                    </div>
                ))}
            </div>
        </div>
    );
}
