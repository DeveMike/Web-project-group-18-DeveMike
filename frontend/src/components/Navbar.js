import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // tyylit sitten joskus

function Navbar() {
    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li><Link to="/login">Kirjaudu</Link></li>
                <li><Link to="/register">Rekisteröidy</Link></li>
                <li><Link to="/dashboard">Oma sivu</Link></li>
                <li><Link to="/showtimes">Näytösajat</Link></li>
                <li><Link to="/search">Haku</Link></li>
            </ul>
        </nav>
    );
}

export default Navbar;
