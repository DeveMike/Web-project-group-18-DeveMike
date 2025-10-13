import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.svg';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleLinkClick = () => setMenuOpen(false); // sulkee valikon

  return (
    <nav className="navbar">
      <Link to="/" onClick={handleLinkClick}>
        <img src={logo} alt="LeffaHub" className="logo" />
      </Link>

      <button className="menu-toggle" onClick={toggleMenu}>☰</button>

      <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        <li><Link to="/search" onClick={handleLinkClick}>Haku</Link></li>
        <li><Link to="/reviews" onClick={handleLinkClick}>Arvostelut</Link></li>
        <li><Link to="/showtimes" onClick={handleLinkClick}>Näytösajat</Link></li>
        <li><Link to="/favorites" onClick={handleLinkClick}>Suosikit</Link></li>
        <li><Link to="/groups" onClick={handleLinkClick}>Ryhmät</Link></li>
        <li><Link to="/login" onClick={handleLinkClick}>Kirjaudu</Link></li>
        <li><Link to="/register" onClick={handleLinkClick}>Rekisteröidy</Link></li>
        <li><Link to="/dashboard" onClick={handleLinkClick}>Oma sivu</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
