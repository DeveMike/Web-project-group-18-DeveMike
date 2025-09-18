import { api } from './api';

const GroupService = {
  getMyGroups: () => api.get('/groups/my-groups'),
  getAllGroups: () => api.get('/groups/all'),
  getGroup: (id) => api.get(`/groups/${id}`),

  createGroup: (name) => api.post('/groups/create', { group_name: name }),
  deleteGroup: (id) => api.delete(`/groups/${id}`),

  requestJoin: (id) => api.post(`/groups/${id}/join`),
  listJoinRequests: (id) => api.get(`/groups/${id}/requests`),
  approveJoin: (id, email) => api.post(`/groups/${id}/requests/approve`, { email }),
  rejectJoin: (id, email) => api.post(`/groups/${id}/requests/reject`, { email }),
  addMember: (id, email) => api.post(`/groups/${id}/members`, { email }),
  removeMember: (id, email) => api.post(`/groups/${id}/members/remove`, { email }),
  leaveGroup: (id) => api.post(`/groups/${id}/leave`),
};

export default GroupService;

