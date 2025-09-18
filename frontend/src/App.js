import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoutes';
import Showtimes from './pages/Showtimes';
import GroupsHub from './pages/GroupsHub';
import Navbar from './components/Navbar';
import Search from "./components/Search";
import Reviews from './pages/reviews/Reviews';
import WriteReview from './pages/reviews/WriteReview'
import Review from './pages/reviews/SingleReview'
import './App.css';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/showtimes" element={<Showtimes />} />
                <Route path="/search" element={<Search />} />
                <Route path="/groups" element={<ProtectedRoute><GroupsHub /></ProtectedRoute>}/>
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/reviews/write" element={<WriteReview />} />
                <Route path="/reviews/:id" element={<Review />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
