const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/usersModel');
const { validateEmail, validatePassword } = require('../utils/validators');

const AuthService = {
  async register(email, password) {
    if (!email || !password) {
      return { status: 400, body: { error: 'Sähköposti ja salasana vaaditaan' } };
    }

    if (!validateEmail(email)) {
      return { status: 400, body: { error: 'Virheellinen sähköpostiosoite' } };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { status: 400, body: { error: 'Salasana ei täytä vaatimuksia', details: passwordValidation.errors } };
    }

    const exists = await UserModel.findUserIdByEmail(email);
    if (exists) {
      return { status: 409, body: { error: 'Sähköpostiosoite on jo käytössä' } };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await UserModel.insertUser(email, passwordHash);

    const token = jwt.sign(
      { userId: newUser.user_id, email: email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    return {
      status: 201,
      body: {
        message: 'Rekisteröityminen onnistui',
        user: {
          id: newUser.user_id,
          email: newUser.email,
          createdAt: newUser.created_at
        },
        token
      }
    };
  },

  async login(email, password) {
    if (!email || !password) {
      return { status: 400, body: { error: 'Sähköposti ja salasana vaaditaan' } };
    }

    const user = await UserModel.findUserForLogin(email);
    if (!user) {
      return { status: 401, body: { error: 'Virheellinen sähköposti tai salasana' } };
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return { status: 401, body: { error: 'Virheellinen sähköposti tai salasana' } };
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, theme: user.theme },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    return {
      status: 200,
      body: {
        message: 'Kirjautuminen onnistui',
        user: {
          id: user.user_id,
          email: user.email,
          theme: user.theme,
          createdAt: user.created_at 
        },
        token
      }
    };
  },

  async deleteAccount(userId) {
    await UserModel.deleteReviewsByUserId(userId);
    const deleted = await UserModel.deleteUserById(userId);
    if (!deleted) {
      return { status: 404, body: { error: 'Käyttäjää ei löytynyt' } };
    }
    return {
      status: 200,
      body: {
        message: 'Käyttäjätili poistettu onnistuneesti',
        deletedEmail: deleted.email
      }
    };
  },

  async updateTheme(userId, theme) {
    if (!theme) {
      return { status: 400, body: { error: 'Teema vaaditaan' } };
    }
    const updated = await UserModel.updateTheme(userId, theme);
    if (!updated) {
      return { status: 404, body: { error: 'Käyttäjää ei löytynyt' } };
    }
    return {
      status: 200,
      body: {
        message: 'Teema päivitetty onnistuneesti',
        user: {
          id: updated.user_id,
          theme: updated.theme
        }
      }
    };
  }
};

module.exports = AuthService;