const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.delete('/delete-account', authenticateToken, authController.deleteAccount);

router.put('/theme', authenticateToken, authController.updateTheme);

router.post('/logout', authenticateToken, (req, res) => {
    console.log(`Käyttäjä ${req.email} kirjautui ulos`);
    res.json({ message: 'Kirjauduttu ulos onnistuneesti' });
});

module.exports = router;