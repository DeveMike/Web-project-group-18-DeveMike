import React, { useEffect, useState } from 'react';
import '../styles/MovieModal.css';

function MovieModal({ movie, areaId, onClose }) {
    const [details, setDetails] = useState(null);
    const [groupedShowtimes, setGroupedShowtimes] = useState({});
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!movie) return;

        const fetchDetails = async () => {
            try {
                const res = await fetch(`https://www.finnkino.fi/xml/Events/?includeVideos=true&includeLinks=true`);
                const xmlText = await res.text();
                const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
                const events = xmlDoc.getElementsByTagName('Event');

                for (let i = 0; i < events.length; i++) {
                    const event = events[i];
                    const title = event.getElementsByTagName('Title')[0]?.textContent?.trim();
                    if (title === movie.title) {
                        const synopsis = event.getElementsByTagName('Synopsis')[0]?.textContent;
                        const eventID = event.getElementsByTagName('ID')[0]?.textContent;
                        setDetails({ synopsis, eventID });
                        break;
                    }
                }
            } catch (err) {
                console.error('Elokuvan lisätietojen haku epäonnistui:', err);
            }
        };

        fetchDetails();
    }, [movie]);

    useEffect(() => {
    setExpanded(false); // resetoi "Näytä lisää" aina kun uusi elokuva avataan
}, [movie]);


    useEffect(() => {
        if (!details?.eventID || !areaId) return;

        const fetchShowtimes = async () => {
            try {
                const res = await fetch(`https://www.finnkino.fi/xml/Schedule/?area=${areaId}&eventID=${details.eventID}&nrOfDays=7`);
                const xmlText = await res.text();
                const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
                const showsXml = xmlDoc.getElementsByTagName('Show');

                const grouped = {};
                for (let i = 0; i < showsXml.length; i++) {
                    const show = showsXml[i];
                    const startTime = show.getElementsByTagName('dttmShowStart')[0]?.textContent;
                    if (startTime) {
                        const date = new Date(startTime).toLocaleDateString('fi-FI', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit'
                        });
                        if (!grouped[date]) {
                            grouped[date] = [];
                        }
                        grouped[date].push(
                            new Date(startTime).toLocaleTimeString('fi-FI', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        );
                    }
                }

                setGroupedShowtimes(grouped);
            } catch (err) {
                console.error('Näytösaikojen haku epäonnistui:', err);
            }
        };

        fetchShowtimes();
    }, [details, areaId]);

    if (!movie) return null;

    const shortText = details?.synopsis?.slice(0, 300); // lyhyt versio

    return (
        <div className="movie-modal-overlay" onClick={onClose}>
            <div className="movie-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <div className="modal-layout">
                    <img src={movie.image} alt={movie.title} className="modal-poster" />
                    <div className="modal-info">
                        <h2>{movie.title}</h2>
                        {details?.synopsis && (
                            <>
                                <p>
                                    {expanded ? details.synopsis : `${shortText}...`}
                                </p>
                                <button className="toggle-button" onClick={() => setExpanded(!expanded)}>
                                    {expanded ? 'Näytä vähemmän' : 'Näytä lisää'}
                                </button>
                            </>
                        )}
                        <h4>Näytösajat (7 päivää):</h4>
                        <div className="scroll-box">
                            {Object.entries(groupedShowtimes).map(([date, times], index) => (
                                <div key={index} className="showtime-day">
                                    <strong>{date}</strong><br />
                                    {times.join(', ')}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieModal;
