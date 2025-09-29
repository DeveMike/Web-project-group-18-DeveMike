import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/api';
import '../styles/Auth.css';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (formData.password !== formData.confirmPassword) {
            setErrors({ general: 'Salasanat eivät täsmää' });
            return;
        }

        setLoading(true);
        try {
            await authService.register(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            setErrors(error);
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
                <h2>Rekisteröidy</h2>
                
                {errors.error && (
                    <div className="error-message">
                        {errors.error}
                        {errors.details && (
                            <ul className="error-details">
                                {Object.entries(errors.details).map(([key, value]) => 
                                    value && <li key={key}>{value}</li>
                                )}
                            </ul>
                        )}
                    </div>
                )}

                {errors.general && (
                    <div className="error-message">{errors.general}</div>
                )}
                
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
                        placeholder="Min. 8 merkkiä, iso kirjain, numero"
                    />
                </div>
                
                <div className="form-group">
                    <label>Vahvista salasana</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Rekisteröidään...' : 'Rekisteröidy'}
                </button>
                
                <div className="auth-links">
                    <p>Onko sinulla jo tili? <Link to="/login">Kirjaudu sisään</Link></p>
                </div>
            </form>
        </div>
    );
}

export default Register;