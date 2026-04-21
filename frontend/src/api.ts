const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('nagriksetu_token');
}

function setToken(token: string): void {
  localStorage.setItem('nagriksetu_token', token);
}

function clearToken(): void {
  localStorage.removeItem('nagriksetu_token');
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// ─── Auth ──────────────────────────────────

export async function apiRegister(params: {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  adminKey?: string;
  phone?: string;
}) {
  const body: any = {
    name: params.name,
    email: params.email,
    password: params.password,
    role: params.role
  };
  if (params.role === 'admin' && params.adminKey) {
    body.adminKey = params.adminKey;
  }
  if (params.phone) {
    body.phone = params.phone;
  }

  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  setToken(data.token);
  return data.user;
}

export async function apiLogin(email: string, password: string) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  setToken(data.token);
  return data.user;
}

export async function apiGetMe() {
  const data = await request('/auth/me');
  return data.user;
}

export function apiLogout() {
  clearToken();
  localStorage.removeItem('nagriksetu_isLoggedIn');
  localStorage.removeItem('nagriksetu_user');
  localStorage.removeItem('nagriksetu_issues');
  localStorage.removeItem('nagriksetu_notifications');
}

export function hasToken(): boolean {
  return !!getToken();
}

// ─── Hazards ──────────────────────────────

export async function apiGetAllHazards() {
  return await request('/data/all');
}

export async function apiGetMyHazards() {
  return await request('/data');
}

export async function apiCreateHazard(hazard: {
  title: string;
  description: string;
  category: string;
  priority: string;
  location: string;
  imageUrl?: string;
}) {
  return await request('/data', {
    method: 'POST',
    body: JSON.stringify(hazard)
  });
}

export async function apiUpdateHazardStatus(id: string, status: string, comment: string) {
  return await request(`/data/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, comment })
  });
}

export async function apiToggleUpvote(id: string) {
  return await request(`/data/${id}/upvote`, {
    method: 'PUT'
  });
}

export async function apiDeleteHazard(id: string) {
  return await request(`/data/${id}`, {
    method: 'DELETE'
  });
}
