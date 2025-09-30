import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // tyylit sitten joskus

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">LeffaHub</div>
            <ul className="navbar-links">
                <li><Link to="/login">Kirjaudu</Link></li>
                <li><Link to="/register">Rekisteröidy</Link></li>
                <li><Link to="/dashboard">Oma sivu</Link></li>
                <li><Link to="/showtimes">Näytösajat</Link></li>
                <li><Link to="/groups">Ryhmät</Link></li>
                <li><Link to="/search">Haku</Link></li>
                <li><Link to="/reviews">Arvostelut</Link></li>
                <li><Link to="/favorites">Suosikit</Link></li>
                
            </ul>
        </nav>
    );
}

export default Navbar;
