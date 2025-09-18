import React from 'react';
import '../styles/MovieCard.css';


function MovieCard({ title, image, onClick }) {
    return (
        <div className="movie-card" onClick={onClick} style={{ cursor: 'pointer' }}>
            {image && <img src={image} alt={title} className="movie-poster" />}
            <h3>{title}</h3>
        </div>
    );
}

export default MovieCard;
