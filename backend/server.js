const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/groups', groupRoutes);

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ 
        message: '🎬 Elokuvasovelluksen API toimii!',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            deleteAccount: 'DELETE /api/auth/delete-account',
            logout: 'POST /api/auth/logout'
        }
    });
});

app.use('/api/auth', authRoutes);

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Reittiä ei löytynyt',
        requestedUrl: req.url 
    });
});

app.use((err, req, res, next) => {
    console.error('Palvelinvirhe:', err.stack);
    res.status(500).json({ 
        error: 'Jotain meni pieleen!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Palvelin käynnissä portissa ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log('========================================');
    console.log('Testaa:');
    console.log(`curl http://localhost:${PORT}`);
    console.log('========================================');
});