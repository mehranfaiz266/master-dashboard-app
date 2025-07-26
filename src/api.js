import { auth } from './firebase';

const API_URL = process.env.REACT_APP_API_URL;

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const user = auth.currentUser;
  if (user) {
    headers['Authorization'] = 'Bearer ' + await user.getIdToken();
  }
  const res = await fetch(API_URL + path, { ...options, headers });
  if (!res.ok) throw new Error('Request failed');
  if (res.status === 204) return null;
  return await res.json();
}

export const getClients = () => request('/clients');
export const getClient = id => request(`/clients/${id}`);
export const createClient = data => request('/clients', { method: 'POST', body: JSON.stringify(data) });
export const updateClient = (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const addCampaign = (id, name) => request(`/clients/${id}/campaigns`, { method: 'POST', body: JSON.stringify({ name }) });
export const deleteCampaign = (id, cid) => request(`/clients/${id}/campaigns/${cid}`, { method: 'DELETE' });
export const addNumber = (id, number) => request(`/clients/${id}/phoneNumbers`, { method: 'POST', body: JSON.stringify({ number }) });
export const deleteNumber = (id, nid) => request(`/clients/${id}/phoneNumbers/${nid}`, { method: 'DELETE' });
