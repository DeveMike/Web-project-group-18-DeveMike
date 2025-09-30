import React from 'react';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import './Navbar.css'; // tyylit sitten joskus

function Navbar() {
    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li><Link to="/login">Kirjaudu</Link></li>
                <li><Link to="/register">Rekisteröidy</Link></li>
                <li><Link to="/dashboard">Oma sivu</Link></li>
                <li><Link to="/showtimes">Näytösajat</Link></li>
                <li><Link to="/groups">Ryhmät</Link></li>
                <li><Link to="/search">Haku</Link></li>
                <li><Link to="/reviews">Arvostelut</Link></li>
            </ul>
            <div className="navbar-right">
                <ThemeSwitcher />
            </div>
        </nav>
    );
}

export default Navbar;
