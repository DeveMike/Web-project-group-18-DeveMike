import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/api';
import '../styles/Auth.css';

function Dashboard() {
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        try {
            await authService.deleteAccount();
            navigate('/register');
        } catch (error) {
            alert('Tilin poistaminen epäonnistui: ' + error.error);
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Tervetuloa elokuvasovellukseen!</h1>
                    <p>Olet kirjautunut sisään</p>
                </div>

                <div className="user-info">
                    <h3>Käyttäjätiedot:</h3>
                    <p><strong>Sähköposti:</strong> {user.email}</p>
                    <p><strong>Käyttäjä ID:</strong> {user.id}</p>
                    <p><strong>Rekisteröitynyt:</strong> {new Date(user.createdAt).toLocaleDateString('fi-FI')}</p>
                </div>

                <div className="button-group">
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Kirjaudu ulos
                    </button>
                    
                    {!showDeleteConfirm ? (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)} 
                            className="btn btn-danger"
                        >
                            Poista tili
                        </button>
                    ) : (
                        <div>
                            <p>Oletko varma? Tätä ei voi perua!</p>
                            <button 
                                onClick={handleDeleteAccount} 
                                className="btn btn-danger"
                            >
                                Kyllä, poista tili
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(false)} 
                                className="btn btn-secondary"
                                style={{marginLeft: '10px'}}
                            >
                                Peruuta
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;