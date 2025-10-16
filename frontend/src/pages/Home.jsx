import React from "react";
import Search from "../components/Search.jsx";
import Showtimes from "./Showtimes.js";
import Reviews from "./reviews/Reviews.js";
import "../styles/Home.css";

export default function Home() {
  return (
    <main className="home" role="main">
      {/* Hero */}
      <section className="home-hero" aria-label="Tervetuloa">
        <h1>Tervetuloa LeffaHubiin – löydä elokuvat, ryhmät ja arvostelut</h1>
        <p className="home-hero__sub">Etsi elokuvia, tarkista näytösajat ja lue tuoreimmat arvostelut yhdestä paikasta.</p>
      </section>

      {/* Haku */}
      <section className="home-section home-section--search" aria-labelledby="home-search-title">
        <header className="home-section__header">
          <h2 id="home-search-title">Haku</h2>
          <a href="/search" className="home-link">Näytä kaikki haut</a>
        </header>
        <div className="home-section__body">
          <Search />
        </div>
      </section>

      {/* Näytösajat */}
      <section className="home-section home-section--showtimes" aria-labelledby="home-showtimes-title">
        <header className="home-section__header">
          <h2 id="home-showtimes-title">Näytösajat</h2>
          <a href="/showtimes" className="home-link">Kaikki teatterit</a>
        </header>
        <div className="home-section__body">
          <Showtimes />
        </div>
      </section>

      {/* Arvostelut */}
      <section className="home-section home-section--reviews" aria-labelledby="home-reviews-title">
        <header className="home-section__header">
          <h2 id="home-reviews-title">Uusimmat arvostelut</h2>
          <a href="/reviews" className="home-link">Näytä kaikki</a>
        </header>
        <div className="home-section__body">
          <Reviews />
        </div>
      </section>
    </main>
  );
}