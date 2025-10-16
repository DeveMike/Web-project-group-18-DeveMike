const GroupService = require('../services/groupService');

const createGroup = async (req, res) => {
  const { group_name } = req.body;
  const owner_id = req.userId;
  const { status, body } = await GroupService.createGroup({ group_name, owner_id });
  return res.status(status).json(body);
};

const addMovieToGroup = async (req, res, next) => {
  try {
    const tmdb_id = req.body.tmdb_id;
    const reqGroupId = req.params.id;
    const userId = req.userId;

    const { status, body } = await GroupService.addMovieToGroup({ tmdb_id, reqGroupId, userId });
    return res.status(status).json(body);
  } catch (e) {
    return next(e);
  }
};

const addShowtimeToGroup = async (req, res, next) => {
  try {
    const st = req.body?.showtime;
    const reqGroupId = req.params.id;
    const userId = req.userId;

    const { status, body } = await GroupService.addShowtimeToGroup({ st, reqGroupId, userId });
    return res.status(status).json(body);
  } catch (e) {
    return next(e);
  }
};

const getAllGroups = async (req, res) => {
  const { status, body } = await GroupService.getAllGroups();
  return res.status(status).json(body);
};

const getUserGroups = async (req, res) => {
  const { status, body } = await GroupService.getUserGroups(req.userId);
  return res.status(status).json(body);
};

const getGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { status, body } = await GroupService.getGroup({ id, userId });
  return res.status(status).json(body);
};

const getGroupMovies = async (req, res, next) => {
  try {
    const { status, body } = await GroupService.getGroupMovies({ userId: req.userId, reqGroupId: req.params.id });
    return res.status(status).json(body);
  } catch (e) {
    return next(e);
  }
};

const getGroupShowtimes = async (req, res, next) => {
  try {
    const { status, body } = await GroupService.getGroupShowtimes({ userId: req.userId, reqGroupId: req.params.id });
    return res.status(status).json(body);
  } catch (e) {
    return next(e);
  }
};

const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { status, body } = await GroupService.deleteGroup({ id, userId });
  return res.status(status).json(body);
};

const requestJoin = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.userId;
  const { status, body } = await GroupService.requestJoin({ groupId, userId });
  return res.status(status).json(body);
};

const listJoinRequests = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const ownerId = req.userId;
  const { status, body } = await GroupService.listJoinRequests({ groupId, ownerId });
  return res.status(status).json(body);
};

const approveJoinRequest = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const ownerId = req.userId;
  const emailRaw = req.body?.email;
  const { status, body } = await GroupService.approveJoinRequest({ groupId, ownerId, emailRaw });
  return res.status(status).json(body);
};

const rejectJoinRequest = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const ownerId = req.userId;
  const emailRaw = req.body?.email;
  const { status, body } = await GroupService.rejectJoinRequest({ groupId, ownerId, emailRaw });
  return res.status(status).json(body);
};

const addMember = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const ownerId = req.userId;
  const emailRaw = req.body?.email;
  const { status, body } = await GroupService.addMember({ groupId, ownerId, emailRaw });
  return res.status(status).json(body);
};

const removeMember = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const ownerId = req.userId;
  const emailRaw = req.body?.email;
  const { status, body } = await GroupService.removeMember({ groupId, ownerId, emailRaw });
  return res.status(status).json(body);
};

const leaveGroup = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.userId;
  const { status, body } = await GroupService.leaveGroup({ groupId, userId });
  return res.status(status).json(body);
};

module.exports = {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroup,
  deleteGroup,
  requestJoin,
  listJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  addMember,
  removeMember,
  leaveGroup,
  addMovieToGroup,
  getGroupMovies,
  addShowtimeToGroup,
  getGroupShowtimes
};