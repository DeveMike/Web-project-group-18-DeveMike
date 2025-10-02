const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { validateEmail, validatePassword } = require('../utils/validators');

// ============================================
// FUNKTIO 1: REKISTERÖITYMINEN
// ============================================
const register = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Sähköposti ja salasana vaaditaan' 
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ 
                error: 'Virheellinen sähköpostiosoite' 
            });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                error: 'Salasana ei täytä vaatimuksia',
                details: passwordValidation.errors 
            });
        }

        const userExists = await pool.query(
            'SELECT user_id FROM users WHERE email = $1',
            [email]
        );
        
        if (userExists.rows.length > 0) {
            return res.status(409).json({ 
                error: 'Sähköpostiosoite on jo käytössä' 
            });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email, created_at',
            [email, passwordHash]
        );

        const token = jwt.sign(
            { 
                userId: newUser.rows[0].user_id, 
                email: email 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            message: 'Rekisteröityminen onnistui',
            user: {
                id: newUser.rows[0].user_id,
                email: newUser.rows[0].email,
                createdAt: newUser.rows[0].created_at
            },
            token
        });
        
    } catch (error) {
        console.error('Rekisteröitymisvirhe:', error);
        res.status(500).json({ 
            error: 'Palvelinvirhe rekisteröitymisessä' 
        });
    }
};

// ============================================
// FUNKTIO 2: KIRJAUTUMINEN - KORJATTU
// ============================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Sähköposti ja salasana vaaditaan' 
            });
        }

        const user = await pool.query(
            'SELECT user_id, email, password_hash, theme, created_at FROM users WHERE email = $1;',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Virheellinen sähköposti tai salasana' 
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password_hash
        );
        
        if (!validPassword) {
            return res.status(401).json({ 
                error: 'Virheellinen sähköposti tai salasana' 
            });
        }

        const token = jwt.sign(
            { 
                userId: user.rows[0].user_id, 
                email: user.rows[0].email,
                theme: user.rows[0].theme
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(200).json({
            message: 'Kirjautuminen onnistui',
            user: {
                id: user.rows[0].user_id,
                email: user.rows[0].email,
                theme: user.rows[0].theme,
                createdAt: user.rows[0].created_at 
            },
            token
        });
        
    } catch (error) {
        console.error('Kirjautumisvirhe:', error);
        res.status(500).json({ 
            error: 'Palvelinvirhe kirjautumisessa' 
        });
    }
};

// ============================================
// FUNKTIO 3: TILIN POISTAMINEN
// ============================================
const deleteAccount = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            'DELETE FROM users WHERE user_id = $1 RETURNING email;',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Käyttäjää ei löytynyt' 
            });
        }
        
        res.status(200).json({
            message: 'Käyttäjätili poistettu onnistuneesti',
            deletedEmail: result.rows[0].email
        });
        
    } catch (error) {
        console.error('Tilin poistamisvirhe:', error);
        res.status(500).json({ 
            error: 'Palvelinvirhe tilin poistamisessa' 
        });
    }
};

// ============================================
// FUNKTIO 4: TEEMAN PÄIVITYS
// ============================================
const updateTheme = async (req, res) => {
    try {
        const userId = req.userId;
        const { theme } = req.body;

        if (!theme) {
            return res.status(400).json({ error: 'Teema vaaditaan' });
        }

        const result = await pool.query(
            'UPDATE users SET theme = $1, updated_at = now() WHERE user_id = $2 RETURNING user_id, theme;',
            [theme, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Käyttäjää ei löytynyt' });
        }

        res.status(200).json({
            message: 'Teema päivitetty onnistuneesti',
            user: {
                id: result.rows[0].user_id,
                theme: result.rows[0].theme
            }
        });

    } catch (error) {
        console.error('Teeman päivitysvirhe:', error);
        res.status(500).json({ error: 'Palvelinvirhe teeman päivityksessä' });
    }
};

module.exports = {
    register,
    login,
    deleteAccount,
    updateTheme
};