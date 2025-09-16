import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

// Sivut
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Showtimes from "./pages/Showtimes";
import GroupsHub from "./pages/GroupsHub";
import authService from "./services/api";

function ProtectedRoute({ children }) {
  const authed = authService.isAuthenticated();
  return authed ? children : <Navigate to="/login" replace />;
}

//Ohjaa kirjautuneen suoraan /dashboardiin
function PublicRoute({ children }) {
  const authed = authService.isAuthenticated();
  return authed ? <Navigate to="/dashboard" replace /> : children;
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Sivua ei löytynyt</h2>
      <p>
        Palaa <a href="/">etusivulle</a>.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/showtimes"
          element={
            <ProtectedRoute>
              <Showtimes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupsHub />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

