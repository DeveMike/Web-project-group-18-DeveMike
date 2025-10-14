const AuthService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { status, body } = await AuthService.register(email, password);
    return res.status(status).json(body);
  } catch (error) {
    console.error('Rekisteröitymisvirhe:', error);
    return res.status(500).json({ error: 'Palvelinvirhe rekisteröitymisessä' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { status, body } = await AuthService.login(email, password);
    return res.status(status).json(body);
  } catch (error) {
    console.error('Kirjautumisvirhe:', error);
    return res.status(500).json({ error: 'Palvelinvirhe kirjautumisessa' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, body } = await AuthService.deleteAccount(userId);
    return res.status(status).json(body);
  } catch (error) {
    console.error('Tilin poistamisvirhe:', error);
    return res.status(500).json({ error: 'Palvelinvirhe tilin poistamisessa' });
  }
};

const updateTheme = async (req, res) => {
  try {
    const userId = req.userId;
    const { theme } = req.body;
    const { status, body } = await AuthService.updateTheme(userId, theme);
    return res.status(status).json(body);
  } catch (error) {
    console.error('Teeman päivitysvirhe:', error);
    return res.status(500).json({ error: 'Palvelinvirhe teeman päivityksessä' });
  }
};

module.exports = {
  register,
  login,
  deleteAccount,
  updateTheme
};