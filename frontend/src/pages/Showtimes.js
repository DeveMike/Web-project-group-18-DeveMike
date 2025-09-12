import React, { useEffect, useState } from 'react';

function Showtimes() {
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [areaId, setAreaId] = useState('1014'); // Helsinki oletuksena

    useEffect(() => {
        const fetchShowtimes = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`https://www.finnkino.fi/xml/Schedule/?area=${areaId}`);
                const xmlText = await response.text();

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

                const showsXml = xmlDoc.getElementsByTagName('Show');
                const parsedShows = [];

                for (let i = 0; i < showsXml.length; i++) {
                    const show = showsXml[i];
                    parsedShows.push({
                        title: show.getElementsByTagName('Title')[0]?.textContent,
                        theatre: show.getElementsByTagName('Theatre')[0]?.textContent,
                        startTime: show.getElementsByTagName('dttmShowStart')[0]?.textContent
                    });
                }

                setShows(parsedShows);
            } catch (err) {
                setError('Näytösten haku epäonnistui.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchShowtimes();
    }, [areaId]);

    return (
        <div className="showtimes-container">
            <h2>Finnkinon näytökset</h2>

            <label>Valitse teatterialue:</label>
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                <option value="1014">Helsinki</option>
                <option value="1012">Espoo</option>
                <option value="1013">Vantaa</option>
                <option value="1015">Turku</option>
                <option value="1016">Tampere</option>
                <option value="1017">Oulu</option>
                {/* Lisää tarvittaessa */}
            </select>

            {loading ? (
                <p>Ladataan näytöksiä...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <ul>
                    {shows.map((show, index) => (
                        <li key={index}>
                            <strong>{show.title}</strong><br />
                            Teatteri: {show.theatre}<br />
                            Aika: {new Date(show.startTime).toLocaleString('fi-FI')}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Showtimes;
