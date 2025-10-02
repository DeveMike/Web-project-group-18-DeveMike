import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import FinnkinoLogo from '../assets/finnkino.png';
import '../styles/Showtimes.css';

function Showtimes() {
    const [areas, setAreas] = useState([]);
    const [areaId, setAreaId] = useState('');
    const [shows, setShows] = useState([]);
    const [images, setImages] = useState({});
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    //  Hae teatterialueet (Espoo suodatettu pois)
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const res = await fetch('https://www.finnkino.fi/xml/TheatreAreas/');
                const xmlText = await res.text();
                const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
                const areaNodes = xmlDoc.getElementsByTagName('TheatreArea');

                const parsedAreas = [];
                for (let i = 0; i < areaNodes.length; i++) {
                    const area = areaNodes[i];
                    const id = area.getElementsByTagName('ID')[0]?.textContent;
                    const name = area.getElementsByTagName('Name')[0]?.textContent;
                    if (
                        id &&
                        name &&
                        name !== 'Valitse alue/teatteri' &&
                        !name.toLowerCase().includes('espoo')
                    ) {
                        parsedAreas.push({ id, name });
                    }
                }

                setAreas(parsedAreas);
                
            } catch (err) {
                setError('Teatterialueiden haku epäonnistui.');
                console.error(err);
            }
        };

        fetchAreas();
    }, []);

    //  Hae elokuvien julistekuvat
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch('https://www.finnkino.fi/xml/Events/');
                const xmlText = await res.text();
                const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
                const eventNodes = xmlDoc.getElementsByTagName('Event');

                const imageMap = {};
                for (let i = 0; i < eventNodes.length; i++) {
                    const event = eventNodes[i];
                    const title = event.getElementsByTagName('Title')[0]?.textContent?.trim();
                    const image = event.getElementsByTagName('EventLargeImagePortrait')[0]?.textContent;
                    if (title && image) {
                        imageMap[title] = image;
                    }
                }

                setImages(imageMap);
            } catch (err) {
                console.error('Julistekuvien haku epäonnistui:', err);
            }
        };

        fetchImages();
    }, []);

    //  Hae näytökset valitulle alueelle ja ryhmittele elokuvittain
    useEffect(() => {
        if (!areaId) return;

        const fetchShowtimes = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`https://www.finnkino.fi/xml/Schedule/?area=${areaId}`);
                const xmlText = await res.text();
                const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
                const showsXml = xmlDoc.getElementsByTagName('Show');

                const grouped = {};
                for (let i = 0; i < showsXml.length; i++) {
                    const show = showsXml[i];
                    const title = show.getElementsByTagName('Title')[0]?.textContent?.trim();
                    const startTime = show.getElementsByTagName('dttmShowStart')[0]?.textContent;
                    if (!grouped[title]) {
                        grouped[title] = [];
                    }
                    grouped[title].push(startTime);
                }

                const parsedShows = Object.entries(grouped).map(([title, times]) => ({
                    title,
                    showtimes: times,
                    image: images[title] || null
                }));

                setShows(parsedShows);
            } catch (err) {
                setError('Näytösten haku epäonnistui.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchShowtimes();
    }, [areaId, images]);

    return (
        <div className="showtimes-container">
            <div className="finnkino-banner">
                <img src={FinnkinoLogo} alt="Finnkino logo" />
            </div>
            <h2>Finnkinon näytökset</h2>

            <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1rem' }}>
                Huom: Espoon teatterit (Omena ja Sello) eivät ole mukana tässä haussa. 
                Ne löytyvät Finnkinon uudelta sivustolta: <a href="https://beta.finnkino.fi/" target="_blank" rel="noopener noreferrer">beta.finnkino.fi</a>
            </p>

            {error && <p className="error-message">{error}</p>}

            <label htmlFor="area-select">Valitse teatterialue:</label>
            <select
                id="area-select"
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
            >
                {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                        {area.name}
                    </option>
                ))}
            </select>

            {!areaId && <p>Valitse teatterialue nähdäksesi näytökset.</p>}


            {areaId && !loading && (
                <div className="show-grid">
                    {shows.map((movie, index) => (
                        <MovieCard
                            key={index}
                            title={movie.title}
                            image={movie.image}
                            onClick={() => setSelectedMovie(movie)}
                        />
                    ))}
                </div>
            )}


            <MovieModal
                movie={selectedMovie}
                areaId={areaId}
                onClose={() => setSelectedMovie(null)}/>

        </div>
    );
}

export default Showtimes;
