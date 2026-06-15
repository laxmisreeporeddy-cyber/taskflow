const BASE = 'http://localhost:5000/api';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const loginUser    = (data) => fetch(`${BASE}/auth/login`,    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const registerUser = (data) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

export const getTasks   = ()        => fetch(`${BASE}/tasks`,          { headers: headers() }).then(r => r.json());
export const createTask = (data)    => fetch(`${BASE}/tasks`,          { method: 'POST',   headers: headers(), body: JSON.stringify(data) }).then(r => r.json());
export const updateTask = (id,data) => fetch(`${BASE}/tasks/${id}`,    { method: 'PUT',    headers: headers(), body: JSON.stringify(data) }).then(r => r.json());
export const deleteTask = (id)      => fetch(`${BASE}/tasks/${id}`,    { method: 'DELETE', headers: headers() }).then(r => r.json());