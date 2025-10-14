const pool = require('../config/database');
const GroupModel = require('../models/groupModel');
const { getImgBaseUrl } = require('../controllers/MovieController.js');


const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

// --- MOVIE FETCH (ulkoinen API) ---
const fetchMovie = async (tmdbId) => {
  const response = await fetch('https://api.themoviedb.org/3/movie/'+tmdbId+'?language=fi-FI', {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer '+process.env.TMDB_TOKEN
    }
  });
  if (response.status === 200) {
    return await response.json();
  } else {
    return Error('Elokuvaa ei saatu haettua TMDB:stä');
  }
};

const GroupService = {
  async createGroup({ group_name, owner_id }) {
    try {
      if (!group_name || group_name.trim() === '') {
        return { status: 400, body: { error: 'Ryhmän nimi vaaditaan' } };
      }

      const existing = await GroupModel.findGroupByName(group_name);
      if (existing.length > 0) {
        return { status: 409, body: { error: 'Samanniminen ryhmä on jo olemassa' } };
      }

      const group = await GroupModel.insertGroup(group_name, owner_id);
      await GroupModel.insertOwnerAsApprovedMember(group.group_id, owner_id);

      return { status: 201, body: { message: 'Ryhmä luotu onnistuneesti', group } };
    } catch (error) {
      console.error('Ryhmän luontivirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe ryhmän luonnissa' } };
    }
  },

  async addMovieToGroup({ tmdb_id, reqGroupId, userId }) {
    try {
      if (!tmdb_id) {
        return { status: 400, body: { error: 'ei bodya' } };
      }

      const groupIdArray = await GroupModel.selectMatchingGroup(userId, reqGroupId);
      if (groupIdArray.length === 0) {
        return { status: 403, body: { error: 'Et kuulu tähän ryhmään' } };
      }

      const groupId = groupIdArray[0].group_id;

      const exist = await GroupModel.findMovieIdByTmdbId(tmdb_id);
      let movieId;
      if (exist.length === 0) {
        const movie = await fetchMovie(tmdb_id);
        const poster_url = (await getImgBaseUrl() + movie.poster_path);
        const release_year = parseInt(movie.release_date.split(0, 4));
        const genre = movie.genres[0].name;
        const vote_average = movie.vote_average;

        movieId = await GroupModel.insertMovieRow({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_url,
          release_year,
          genre,
          vote_average
        });
      } else {
        movieId = exist[0].movie_id;
      }

      const rowCount = await GroupModel.insertGroupMovie(groupId, movieId, userId);
      if (rowCount) {
        return { status: 201, body: { message: 'Elokuva lisätty ryhmään' } };
      } else {
        throw Error('Elokuvaa ei saatu lisättyä ryhmään');
      }
    } catch (e) {
      if (e && e.code == 23505) {
        return { status: 200, body: { message: 'Elokuva on jo ryhmässä' } };
      }
      throw e;
    }
  },

  async addShowtimeToGroup({ st, reqGroupId, userId }) {
    if (!st) {
      return { status: 400, body: { error: 'ei bodya' } };
    }
    const cinemaName = st.cinemaName;
    const title = st.title;
    const datetime = st.datetime;
    const imageUrl = st.imageUrl;

    if (!cinemaName || !title || !datetime || !imageUrl) {
      return { status: 400, body: { error: 'bodysta puuttuu jotakin' } };
    }

    try {
      const groupIdArray = await GroupModel.selectMatchingGroup(userId, reqGroupId);
      if (groupIdArray.length === 0) {
        return { status: 403, body: { error: 'Et kuulu tähän ryhmään' } };
      }

      const groupId = groupIdArray[0].group_id;
      const existing = await GroupModel.selectExistingShowtime(groupId, datetime, cinemaName, title);

      if (existing.length === 0) {
        const ok = await GroupModel.insertShowtime({ groupId, cinemaName, title, datetime, userId, imageUrl });
        if (ok) {
          return { status: 201, body: { message: 'Näytösaika lisätty onnistuneesti' } };
        } else {
          throw Error('Näytösaikaa ei saatu lisättyä ryhmään');
        }
      } else {
        return { status: 200, body: { message: 'Näytösaika on jo ryhmässä' } };
      }
    } catch (e) {
      throw e;
    }
  },

  async getAllGroups() {
    try {
      const groups = await GroupModel.selectAllGroupsWithCounts();
      return { status: 200, body: { groups } };
    } catch (error) {
      console.error('Ryhmien hakuvirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe ryhmien haussa' } };
    }
  },

  async getUserGroups(userId) {
    try {
      const groups = await GroupModel.selectUserGroups(userId);
      return { status: 200, body: { groups } };
    } catch (error) {
      console.error('Käyttäjän ryhmien hakuvirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe ryhmien haussa' } };
    }
  },

  async getGroup({ id, userId }) {
    try {
      const group = await GroupModel.selectGroupWithOwnerEmail(id);
      if (group.rows.length === 0) {
        return { status: 404, body: { error: 'Ryhmää ei löytynyt' } };
      }

      const isMember = await GroupModel.selectIsMemberApproved(id, userId);
      const isOwner = group.rows[0].owner_id === userId;

      if (!isOwner && isMember.rows.length === 0) {
        return { status: 403, body: { error: 'Vain ryhmän jäsenet voivat nähdä ryhmän tiedot' } };
      }

      const members = await GroupModel.selectMembersWithEmails(id);

      return {
        status: 200,
        body: {
          group: group.rows[0],
          members,
          userRole: isOwner ? 'owner' : 'member'
        }
      };
    } catch (error) {
      console.error('Ryhmän hakuvirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe ryhmän haussa' } };
    }
  },

  async getGroupMovies({ userId, reqGroupId }) {
    try {
      const groupIdArray = await GroupModel.selectMatchingGroup(userId, reqGroupId);
      if (groupIdArray.length === 0) {
        return { status: 403, body: { error: 'Et kuulu tähän ryhmään' } };
      }
      const groupId = groupIdArray[0].group_id;
      const rows = await GroupModel.selectGroupMovies(groupId);
      return { status: 200, body: rows };
    } catch (e) {
      throw e;
    }
  },

  async getGroupShowtimes({ userId, reqGroupId }) {
    try {
      const groupIdArray = await GroupModel.selectMatchingGroup(userId, reqGroupId);
      if (groupIdArray.length === 0) {
        return { status: 403, body: { error: 'Et kuulu tähän ryhmään' } };
      }
      const groupId = groupIdArray[0].group_id;
      const rows = await GroupModel.selectGroupShowtimes(groupId);
      return { status: 200, body: rows };
    } catch (e) {
      throw e;
    }
  },

  async deleteGroup({ id, userId }) {
    try {
      const group = await GroupModel.findGroupOwnedBy(id, userId);
      if (group.rows.length === 0) {
        return { status: 403, body: { error: 'Vain ryhmän omistaja voi poistaa ryhmän' } };
      }
      await GroupModel.deleteGroupById(id);
      return { status: 200, body: { message: 'Ryhmä poistettu onnistuneesti' } };
    } catch (error) {
      console.error('Ryhmän poistovirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe ryhmän poistossa' } };
    }
  },

  async requestJoin({ groupId, userId }) {
    try {
      const g = await GroupModel.selectGroupOwner(groupId);
      if (g.rowCount === 0) return { status: 404, body: { error: 'Ryhmää ei löytynyt' } };
      if (g.rows[0].owner_id === userId) {
        return { status: 400, body: { error: 'Et voi pyytää liittymistä omaan ryhmääsi' } };
      }

      const ex = await GroupModel.selectMemberStatus(groupId, userId);
      if (ex.rowCount > 0) {
        const st = ex.rows[0].status;
        if (st === 'approved') return { status: 409, body: { error: 'Olet jo ryhmän jäsen' } };
        if (st === 'pending')  return { status: 409, body: { error: 'Sinulla on jo avoin liittymispyyntö' } };
      }

      await GroupModel.insertJoinPending(groupId, userId);
      return { status: 201, body: { message: 'Liittymispyyntö lähetetty' } };
    } catch (error) {
      console.error('Liittymispyyntövirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe liittymispyynnössä' } };
    }
  },

  async listJoinRequests({ groupId, ownerId }) {
    try {
      const g = await GroupModel.selectGroupOwner(groupId);
      if (g.rowCount === 0) return { status: 404, body: { error: 'Ryhmää ei löytynyt' } };
      if (g.rows[0].owner_id !== ownerId) {
        return { status: 403, body: { error: 'Vain omistaja voi tarkastella pyyntöjä' } };
      }

      const rows = await GroupModel.listPendingRequests(groupId);
      return { status: 200, body: { requests: rows } };
    } catch (error) {
      console.error('Pyyntöjen listausvirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe pyyntöjen haussa' } };
    }
  },

  async approveJoinRequest({ groupId, ownerId, emailRaw }) {
    const client = await pool.connect();
    try {
      if (!emailRaw) return { status: 400, body: { error: 'email vaaditaan bodyssa' } };
      const email = normalizeEmail(emailRaw);

      await GroupModel.txBegin(client);

      const g = await GroupModel.txSelectOwner(client, groupId);
      if (g.rowCount === 0) { await GroupModel.txRollback(client); return { status: 404, body: { error: 'Ryhmää ei löytynyt' } }; }
      if (g.rows[0].owner_id !== ownerId) { await GroupModel.txRollback(client); return { status: 403, body: { error: 'Vain omistaja voi hyväksyä pyyntöjä' } }; }

      const u = await GroupModel.txFindUserIdByEmail(client, email);
      if (u.rowCount === 0) { await GroupModel.txRollback(client); return { status: 404, body: { error: 'Käyttäjää ei löytynyt annetulla sähköpostilla' } }; }
      const targetUserId = u.rows[0].user_id;

      const pending = await GroupModel.txHasPending(client, groupId, targetUserId);
      if (pending.rowCount === 0) { await GroupModel.txRollback(client); return { status: 404, body: { error: 'Liittymispyyntöä ei löytynyt' } }; }

      await GroupModel.txApprovePending(client, groupId, targetUserId);
      await GroupModel.txCommit(client);
      return { status: 200, body: { message: 'Liittymispyyntö hyväksytty' } };
    } catch (error) {
      await GroupModel.txRollback(client);
      console.error('Pyynnön hyväksyntävirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe pyynnön hyväksynnässä' } };
    } finally {
      client.release();
    }
  },

  async rejectJoinRequest({ groupId, ownerId, emailRaw }) {
    const client = await pool.connect();
    try {
      if (!emailRaw) return { status: 400, body: { error: 'email vaaditaan bodyssa' } };
      const email = normalizeEmail(emailRaw);

      await GroupModel.txBegin(client);

      const g = await GroupModel.txSelectOwner(client, groupId);
      if (g.rowCount === 0) { await GroupModel.txRollback(client); return { status: 404, body: { error: 'Ryhmää ei löytynyt' } }; }
      if (g.rows[0].owner_id !== ownerId) { await GroupModel.txRollback(client); return { status: 403, body: { error: 'Vain omistaja voi hylätä pyyntöjä' } }; }

      const u = await GroupModel.txFindUserIdByEmail(client, email);
      if (u.rowCount === 0) { await GroupModel.txRollback(client); return { status: 404, body: { error: 'Käyttäjää ei löytynyt annetulla sähköpostilla' } }; }
      const targetUserId = u.rows[0].user_id;

      const del = await GroupModel.txDeletePending(client, groupId, targetUserId);

      await GroupModel.txCommit(client);

      if (del.rowCount === 0) return { status: 404, body: { error: 'Liittymispyyntöä ei löytynyt' } };
      return { status: 200, body: { message: 'Liittymispyyntö hylätty' } };
    } catch (error) {
      await GroupModel.txRollback(client);
      console.error('Pyynnön hylkäysvirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe pyynnön hylkäämisessä' } };
    } finally {
      client.release();
    }
  },

  async addMember({ groupId, ownerId, emailRaw }) {
    try {
      if (!emailRaw) return { status: 400, body: { error: 'email vaaditaan bodyssa' } };
      const email = normalizeEmail(emailRaw);

      const g = await GroupModel.selectGroupOwner(groupId);
      if (g.rowCount === 0) return { status: 404, body: { error: 'Ryhmää ei löytynyt' } };
      if (g.rows[0].owner_id !== ownerId) {
        return { status: 403, body: { error: 'Vain omistaja voi lisätä jäseniä' } };
      }

      const u = await pool.query('SELECT user_id FROM users WHERE LOWER(email)=LOWER($1)', [email]);
      if (u.rowCount === 0) return { status: 404, body: { error: 'Käyttäjää ei löytynyt annetulla sähköpostilla' } };
      const targetUserId = u.rows[0].user_id;

      const ex = await GroupModel.selectMemberStatus(groupId, targetUserId);

      if (ex.rowCount > 0) {
        const st = ex.rows[0].status;
        if (st === 'approved') return { status: 409, body: { error: 'Käyttäjä on jo jäsen' } };
        if (st === 'pending') {
          await pool.query(
            "UPDATE group_members SET status='approved', joined_at=NOW() WHERE group_id=$1 AND user_id=$2",
            [groupId, targetUserId]
          );
          return { status: 200, body: { message: 'Käyttäjän pending-pyyntö hyväksyttiin' } };
        }
      }

      await pool.query(
        "INSERT INTO group_members (group_id, user_id, status) VALUES ($1,$2,'approved')",
        [groupId, targetUserId]
      );

      return { status: 201, body: { message: 'Jäsen lisätty' } };
    } catch (error) {
      if (error && error.code === '23505') {
        return { status: 409, body: { error: 'Käyttäjä on jo jäsen/pending' } };
      }
      console.error('Jäsenen lisäysvirhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe jäsenen lisäyksessä' } };
    }
  },

  async removeMember({ groupId, ownerId, emailRaw }) {
    try {
      if (!emailRaw) return { status: 400, body: { error: 'email vaaditaan bodyssa' } };
      const email = normalizeEmail(emailRaw);

      const g = await GroupModel.selectGroupOwner(groupId);
      if (g.rowCount === 0) return { status: 404, body: { error: 'Ryhmää ei löytynyt' } };
      if (g.rows[0].owner_id !== ownerId) {
        return { status: 403, body: { error: 'Vain omistaja voi poistaa jäseniä' } };
      }

      const u = await pool.query('SELECT user_id FROM users WHERE LOWER(email)=LOWER($1)', [email]);
      if (u.rowCount === 0) return { status: 404, body: { error: 'Käyttäjää ei löytynyt annetulla sähköpostilla' } };
      const targetUserId = u.rows[0].user_id;

      if (targetUserId === ownerId) {
        return { status: 400, body: { error: 'Omistajaa ei voi poistaa. Siirrä omistus tai poista ryhmä.' } };
      }

      const del = await GroupModel.deleteMember(groupId, targetUserId);
      if (del.rowCount === 0) {
        return { status: 404, body: { error: 'Käyttäjä ei ole ryhmän jäsen tai pyyntöä ei ole' } };
      }

      return { status: 200, body: { message: 'Jäsen poistettu ryhmästä' } };
    } catch (error) {
      console.error('Jäsenen poistovirhe (owner):', error);
      return { status: 500, body: { error: 'Palvelinvirhe jäsenen poistossa' } };
    }
  },

  async leaveGroup({ groupId, userId }) {
    try {
      const g = await GroupModel.selectGroupOwner(groupId);
      if (g.rowCount === 0) return { status: 404, body: { error: 'Ryhmää ei löytynyt' } };

      if (g.rows[0].owner_id === userId) {
        return { status: 400, body: { error: 'Omistaja ei voi poistua omasta ryhmästään. Poista ryhmä tai siirrä omistus.' } };
      }

      const del = await GroupModel.deleteMember(groupId, userId);
      if (del.rowCount === 0) {
        return { status: 404, body: { error: 'Et ole tämän ryhmän jäsen tai sinulla ei ole pending-pyyntöä' } };
      }

      return { status: 200, body: { message: 'Poistuit ryhmästä' } };
    } catch (error) {
      console.error('Ryhmästä poistuminen -virhe:', error);
      return { status: 500, body: { error: 'Palvelinvirhe ryhmästä poistuttaessa' } };
    }
  },
};

module.exports = GroupService;