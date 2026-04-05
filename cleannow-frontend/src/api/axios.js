import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cleannow_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cleannow_token');
      localStorage.removeItem('cleannow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login:    (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

export const servicesAPI = {
  getAll:  ()         => api.get('/api/services'),
  getOne:  (id)       => api.get(`/api/services/${id}`),
  create:  (data)     => api.post('/api/services', data),
  update:  (id, data) => api.put(`/api/services/${id}`, data),
  delete:  (id)       => api.delete(`/api/services/${id}`),
};

export const demandesAPI = {
  getAll:       ()                  => api.get('/api/demandes'),
  getMine:      ()                  => api.get('/api/demandes/mine'),
  getOne:       (id)                => api.get(`/api/demandes/${id}`),
  create:       (data)              => api.post('/api/demandes', data),
  update:       (id, data)          => api.put(`/api/demandes/${id}`, data),
  updateStatut: (id, statut, motif) => api.patch(`/api/demandes/${id}/statut`, {
    statut, ...(motif && { motif_refus: motif })
  }),
  delete:       (id)                => api.delete(`/api/demandes/${id}`),
};

export const paiementsAPI = {
  getAll:          ()         => api.get('/api/paiements'),
  getByDemande:    (did)      => api.get(`/api/paiements?demande=${did}`),
  create:          (data)     => api.post('/api/paiements', data),
  update:          (id, data) => api.put(`/api/paiements/${id}`, data),
  marquerEffectue: (id)       => api.patch(`/api/paiements/${id}/effectue`),
};

export const evaluationsAPI = {
  getAll:       ()         => api.get('/api/evaluations'),
  getByDemande: (did)      => api.get(`/api/evaluations?demande=${did}`),
  create:       (data)     => api.post('/api/evaluations', {
    demandeServiceId: parseInt(data.demande_id || data.demandeServiceId, 10),
    note:        data.note,
    commentaire: data.commentaire,
  }),
  update:       (id, data) => api.put(`/api/evaluations/${id}`, data),
};

export const usersAPI = {
  getAll:  (role)     => api.get(`/api/users${role ? `?role=${role}` : ''}`),
  getOne:  (id)       => api.get(`/api/users/${id}`),
  create:  (data)     => api.post('/api/users', data),
  update:  (id, data) => api.put(`/api/users/${id}`, data),
  delete:  (id)       => api.delete(`/api/users/${id}`),
  valider: (id)       => api.patch(`/api/users/${id}/valider`),
  rejeter: (id)       => api.patch(`/api/users/${id}/rejeter`),
};






export const passwordAPI = {
  forgotPassword: (email) => api.post('/api/password/forgot', { email }),
  resetPassword: (token, password) => api.post(`/api/password/reset/${token}`, { password }),
};

export const profilAPI = {
  updateProfil: (id, data) => api.patch(`/api/users/${id}/profil`, data),
  changePassword: (id, data) => api.patch(`/api/users/${id}/password`, data),
  getHistoriqueFournisseur: (id) => api.get(`/api/users/${id}/historique`),
  getNotificationsFournisseur: (id) => api.get(`/api/users/${id}/notifications`),
};