import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.svg';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleLinkClick = () => setMenuOpen(false); //valikko pois

  const token = localStorage.getItem('token');
  const isAuthed = Boolean(token);

  const handleLogout = () => {
    // Poista auth-data ja siirry etusivulle
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" onClick={handleLinkClick}>
        <img src={logo} alt="LeffaHub" className="logo" />
      </Link>

      <button className="menu-toggle" onClick={toggleMenu}>☰</button>

      <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        {/* Kaikille näkyvät linkit */}
        <li><Link to="/search" onClick={handleLinkClick}>Haku</Link></li>
        <li><Link to="/reviews" onClick={handleLinkClick}>Arvostelut</Link></li>
        <li><Link to="/showtimes" onClick={handleLinkClick}>Näytösajat</Link></li>

        {/* Vain kirjautuneille */}
        {isAuthed && (
          <>
            <li><Link to="/favorites" onClick={handleLinkClick}>Suosikit</Link></li>
            <li><Link to="/groups" onClick={handleLinkClick}>Ryhmät</Link></li>
            <li><Link to="/dashboard" onClick={handleLinkClick}>Oma sivu</Link></li>
            <li>
              <button className="linklike" onClick={handleLogout}>Kirjaudu ulos</button>
            </li>
          </>
        )}

        {/* Vain vieraille */}
        {!isAuthed && (
          <>
            <li><Link to="/login" onClick={handleLinkClick}>Kirjaudu</Link></li>
            <li><Link to="/register" onClick={handleLinkClick}>Rekisteröidy</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
