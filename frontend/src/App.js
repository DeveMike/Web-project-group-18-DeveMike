import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeBackground from './components/ThemeBackground';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoutes';
import Showtimes from './pages/Showtimes';
import GroupsHub from './pages/GroupsHub';
import Navbar from './components/Navbar';
import Search from "./components/Search";
import Reviews from './pages/reviews/Reviews';
import SearchFilmToReview from './pages/reviews/SearchFilmToReview';
import WriteReview from './pages/reviews/WriteReview';
import Review from './pages/reviews/SingleReview';
import Favorites from './pages/Favorites';
import FavoritesShared from "./pages/FavoritesShared";
import Home from "./pages/Home.jsx";

import './App.css';
import './styles/theme-styles.css';

function App() {
    return (
        <ThemeProvider>
            <ThemeBackground />
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/showtimes" element={<Showtimes />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/groups" element={<ProtectedRoute><GroupsHub /></ProtectedRoute>}/>
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/reviews/write" element={<SearchFilmToReview />} />
                    <Route path="/reviews/write/:id" element={<WriteReview />} />
                    <Route path="/reviews/:id" element={<Review />} />
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <Favorites />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/favorites/shared/:shareId" element={<FavoritesShared />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
