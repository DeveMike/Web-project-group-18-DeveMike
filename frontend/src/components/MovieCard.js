import React from 'react';
import '../styles/MovieCard.css';


function MovieCard({ title, image, year, onClick }) {
    const WithYear = () => {
        return(
            <div className='title-and-year'>
                <h3>{title}</h3>
                <h4>{year}</h4>
            </div>
        );
    };
    return (
        <div className="movie-card" onClick={onClick} style={{ cursor: 'pointer' }}>
            {image && <img src={image} alt={title} className="movie-poster" />}
            {(year) ? <WithYear /> : <h3>{title}</h3>}
        </div>
    );
}

export default MovieCard;
