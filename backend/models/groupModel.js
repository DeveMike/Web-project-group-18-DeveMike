const pool = require('../config/database');

const GroupModel = {
  async selectMatchingGroup(userId, groupId) {
    // RETURNS ARRAY OF ZERO OR ONE
    const select = await pool.query(
      "SELECT group_id FROM group_members WHERE status='approved' AND user_id=$1 AND group_id=$2;",
      [userId, groupId]
    );
    return select.rows;
  },

  // groups
  async findGroupByName(group_name) {
    const existingGroup = await pool.query(
      'SELECT group_id FROM groups WHERE group_name = $1',
      [group_name]
    );
    return existingGroup.rows;
  },

  async insertGroup(group_name, owner_id) {
    const newGroup = await pool.query(
      'INSERT INTO groups (group_name, owner_id) VALUES ($1, $2) RETURNING *',
      [group_name, owner_id]
    );
    return newGroup.rows[0];
  },

  async insertOwnerAsApprovedMember(group_id, owner_id) {
 // Lisää omistaja automaattisesti jäseneksi
    await pool.query(
      'INSERT INTO group_members (group_id, user_id, status) VALUES ($1, $2, $3)',
      [group_id, owner_id, 'approved']
    );
  },

  async deleteGroupById(id) {
    await pool.query('DELETE FROM groups WHERE group_id = $1', [id]);
  },

  async findGroupOwnedBy(id, ownerId) {
    return pool.query(
      'SELECT * FROM groups WHERE group_id = $1 AND owner_id = $2',
      [id, ownerId]
    );
  },

  async findMovieIdByTmdbId(tmdbId) {
    const select = await pool.query('SELECT movie_id FROM movies WHERE tmdb_id=$1;', [tmdbId]);
    return select.rows;
  },

  async insertMovieRow({ id, title, overview, poster_url, release_year, genre, vote_average }) {
    const insert = await pool.query(
      'INSERT INTO movies (tmdb_id, title, description, poster_url, release_year, genre, tmdb_rating)'
      + ' VALUES ($1, $2, $3, $4, $5, $6, $7)'
      + ' RETURNING movie_id;',
      [id, title, overview, poster_url, release_year, genre, vote_average]
    );
    return insert.rows[0].movie_id;
  },

  async insertGroupMovie(groupId, movieId, userId) {
    const insert = await pool.query(
      'INSERT INTO group_movies (group_id, movie_id, added_by_user_id)'
      + ' VALUES ($1, $2, $3);',
      [groupId, movieId, userId]
    );
    return insert.rowCount;
  },

  async selectGroupMovies(groupId) {
    const select = await pool.query(
      'SELECT tmdb_id, title, poster_url, release_year'
      + ' FROM movies'
      + ' INNER JOIN group_movies ON movies.movie_id=group_movies.movie_id'
      + ' WHERE group_id=$1;',
      [groupId]
    );
    return select.rows;
  },

  // showtimes
  async selectExistingShowtime(groupId, datetime, cinemaName, title) {
    const select = await pool.query(
      'SELECT * FROM group_showtimes'
      + ' WHERE group_id=$1 AND showtime=$2 AND theater_name=$3 AND movie_title=$4;',
      [groupId, datetime, cinemaName, title]
    );
    return select.rows;
  },

  async insertShowtime({ groupId, cinemaName, title, datetime, userId, imageUrl }) {
    const insert = await pool.query(
      'INSERT INTO group_showtimes (group_id, theater_name, movie_title, showtime, added_by_user_id, image_url)'
      + ' VALUES ($1, $2, $3, $4, $5, $6);',
      [groupId, cinemaName, title, datetime, userId, imageUrl]
    );
    return insert.rowCount;
  },

  async selectGroupShowtimes(groupId) {
    const select = await pool.query(
      'SELECT * FROM group_showtimes'
      + ' WHERE group_id=$1'
      + ' ORDER BY showtime;',
      [groupId]
    );
    return select.rows;
  },

  // listings
  async selectAllGroupsWithCounts() {
    const groups = await pool.query(`
      SELECT 
        g.group_id,
        g.group_name,
        g.owner_id,
        g.created_at,
        u.email as owner_email,
        COUNT(gm.member_id) as member_count
      FROM groups g
      LEFT JOIN users u ON g.owner_id = u.user_id
      LEFT JOIN group_members gm 
        ON g.group_id = gm.group_id AND gm.status = 'approved'
      GROUP BY g.group_id, u.email
      ORDER BY g.created_at DESC
    `);
    return groups.rows;
  },

  async selectUserGroups(userId) {
    const groups = await pool.query(`
      SELECT 
        g.group_id,
        g.group_name,
        g.owner_id,
        g.created_at,
        u.email as owner_email,
        CASE WHEN g.owner_id = $1 THEN 'owner' ELSE 'member' END as role
      FROM groups g
      LEFT JOIN users u ON g.owner_id = u.user_id
      LEFT JOIN group_members gm ON g.group_id = gm.group_id
      WHERE (g.owner_id = $1 OR (gm.user_id = $1 AND gm.status = 'approved'))
      GROUP BY g.group_id, u.email
      ORDER BY g.created_at DESC
    `, [userId]);
    return groups.rows;
  },

  async selectGroupWithOwnerEmail(id) {
    return pool.query(`
      SELECT g.*, u.email as owner_email
      FROM groups g
      LEFT JOIN users u ON g.owner_id = u.user_id
      WHERE g.group_id = $1
    `, [id]);
  },

  async selectIsMemberApproved(id, userId) {
    return pool.query(`
      SELECT 1 FROM group_members 
      WHERE group_id = $1 AND user_id = $2 AND status = 'approved'
    `, [id, userId]);
  },

  async selectMembersWithEmails(id) {
    const members = await pool.query(`
      SELECT 
        gm.member_id,
        gm.group_id,
        gm.user_id,
        gm.status,
        gm.joined_at,
        u.email
      FROM group_members gm
      LEFT JOIN users u ON gm.user_id = u.user_id
      WHERE gm.group_id = $1
      ORDER BY gm.status DESC, gm.joined_at DESC
    `, [id]);
    return members.rows;
  },

  // membership & join requests
  async selectGroupOwner(groupId) {
    return pool.query('SELECT owner_id FROM groups WHERE group_id=$1', [groupId]);
  },

  async selectMemberStatus(groupId, userId) {
    return pool.query(
      'SELECT status FROM group_members WHERE group_id=$1 AND user_id=$2',
      [groupId, userId]
    );
  },

  async insertJoinPending(groupId, userId) {
    await pool.query(
      'INSERT INTO group_members (group_id, user_id, status) VALUES ($1,$2,$3)',
      [groupId, userId, 'pending']
    );
  },

  async listPendingRequests(groupId) {
    const { rows } = await pool.query(
      `SELECT gm.user_id, gm.joined_at, u.email
       FROM group_members gm
       JOIN users u ON u.user_id = gm.user_id
       WHERE gm.group_id=$1 AND gm.status='pending'
       ORDER BY gm.joined_at ASC`,
      [groupId]
    );
    return rows;
  },

  async deleteMember(groupId, userId) {
    return pool.query(
      'DELETE FROM group_members WHERE group_id=$1 AND user_id=$2 RETURNING status',
      [groupId, userId]
    );
  },

  // transaction helpers
  async txBegin(client) { await client.query('BEGIN'); },
  async txCommit(client) { await client.query('COMMIT'); },
  async txRollback(client) { await client.query('ROLLBACK'); },

  async txSelectOwner(client, groupId) {
    return client.query('SELECT owner_id FROM groups WHERE group_id=$1', [groupId]);
  },

  async txFindUserIdByEmail(client, email) {
    return client.query('SELECT user_id FROM users WHERE LOWER(email)=LOWER($1)', [email]);
  },

  async txHasPending(client, groupId, userId) {
    return client.query(
      "SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND status='pending'",
      [groupId, userId]
    );
  },

  async txApprovePending(client, groupId, userId) {
    return client.query(
      "UPDATE group_members SET status='approved', joined_at=NOW() WHERE group_id=$1 AND user_id=$2",
      [groupId, userId]
    );
  },

  async txDeletePending(client, groupId, userId) {
    return client.query(
      "DELETE FROM group_members WHERE group_id=$1 AND user_id=$2 AND status='pending'",
      [groupId, userId]
    );
  },
};

module.exports = GroupModel;