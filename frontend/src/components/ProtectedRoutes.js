import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/api';

function ProtectedRoute({ children }) {
    const isAuthenticated = authService.isAuthenticated();
    
    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;