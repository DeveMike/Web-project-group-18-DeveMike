import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/api';
import '../styles/Auth.css';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            setError(error.error || 'Kirjautuminen epäonnistui');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-welcome">
                <h1>Tervetuloa LeffaHubiin</h1>
                <p>Löydä elokuvat, ryhmät ja arvostelut</p>
                </div>
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Kirjaudu sisään</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                    <label>Sähköposti</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Salasana</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Kirjaudutaan...' : 'Kirjaudu'}
                </button>
                
                <div className="auth-links">
                    <p>Eikö sinulla ole tiliä? <Link to="/register">Rekisteröidy</Link></p>
                </div>
            </form>
        </div>
    );
}

export default Login;