import React from 'react';
import { Link } from 'react-router-dom';

import './Navbar.css'; // tyylit sitten joskus
import logo from '../assets/logo.svg';

function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/">
                <img src={logo} alt="LeffaHub" className="logo" />
            </Link>
            <ul className="navbar-links">
                <li><Link to="/search">Haku</Link></li>
                <li><Link to="/reviews">Arvostelut</Link></li>
                <li><Link to="/showtimes">Näytösajat</Link></li>
                <li><Link to="/favorites">Suosikit</Link></li>
                <li><Link to="/groups">Ryhmät</Link></li>
                <li><Link to="/login">Kirjaudu</Link></li>
                <li><Link to="/register">Rekisteröidy</Link></li>
                <li><Link to="/dashboard">Oma sivu</Link></li>

            </ul>

        </nav>
    );
}

export default Navbar;
