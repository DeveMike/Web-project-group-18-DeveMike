const pool = require('../config/database');

const UserModel = {
  async findUserIdByEmail(email) {
    const result = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findUserForLogin(email) {
    const result = await pool.query(
      'SELECT user_id, email, password_hash, theme, created_at FROM users WHERE email = $1;',
      [email]
    );
    return result.rows[0] || null;
  },

  async insertUser(email, passwordHash) {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email, created_at',
      [email, passwordHash]
    );
    return result.rows[0];
  },

  async deleteReviewsByUserId(userId) {
    await pool.query('DELETE FROM reviews WHERE user_id = $1', [userId]);
  },

  async deleteUserById(userId) {
    const result = await pool.query(
      'DELETE FROM users WHERE user_id = $1 RETURNING email;',
      [userId]
    );
    return result.rows[0] || null;
  },

  async updateTheme(userId, theme) {
    const result = await pool.query(
      'UPDATE users SET theme = $1, updated_at = now() WHERE user_id = $2 RETURNING user_id, theme;',
      [theme, userId]
    );
    return result.rows[0] || null;
  },
};

module.exports = UserModel;