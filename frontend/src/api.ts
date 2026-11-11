/// <reference types="vite/client" />
export const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
// Use a relative path so all requests go through Vite's proxy (no CORS)
const API_PATH = import.meta.env.VITE_API_PATH || '/api';

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

  const res = await fetch(`${API_PATH}${endpoint}`, {
    ...options,
    headers
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    // If response is not valid JSON, it's likely an HTML error page (e.g. 502/404)
    if (!res.ok) {
      throw new Error(`Server Error (${res.status}): ${text.slice(0, 100)}...`);
    }
    throw new Error('Invalid JSON response from server');
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
}

async function requestFormData(endpoint: string, formData: FormData): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do NOT set Content-Type — browser auto-sets multipart/form-data with boundary
  const res = await fetch(`${API_PATH}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    if (!res.ok) {
      throw new Error(`Server Error (${res.status}): ${text.slice(0, 100)}...`);
    }
    throw new Error('Invalid JSON response from server');
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed');
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

export async function apiAnalyzeText(title: string, description: string) {
  return await request('/data/analyze', {
    method: 'POST',
    body: JSON.stringify({ title, description })
  });
}

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
  imageFile?: File;
}) {
  const formData = new FormData();
  formData.append('title', hazard.title);
  formData.append('description', hazard.description);
  formData.append('category', hazard.category);
  formData.append('priority', hazard.priority);
  formData.append('location', hazard.location);

  if (hazard.imageFile) {
    formData.append('image', hazard.imageFile);
  }

  return await requestFormData('/data', formData);
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

// ─── Chatbot ──────────────────────────────

export async function apiQueryChatbot(message: string) {
  return await request('/chatbot/query', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
}

// ─── Helpers ──────────────────────────────

/** Resolve an imageUrl to its full display URL (handles both server paths and external URLs) */
export function resolveImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  // Already a full URL or data URI
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  // Server-relative path like /uploads/filename.jpg
  return `${API_BASE}${imageUrl}`;
}


// Add this function to your existing api.ts

export const exportToExcel = async (): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  try {
    const response = await fetch(`${API_PATH}/export/excel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Export failed: ${response.status} ${text}`);
    }

    /* Create download */
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NagrikSetu_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

export const exportFilteredToExcel = async (filters: {
  category?: string;
  status?: string;
  priority?: string;
  dateRange?: string;
} = {}): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  try {
    const response = await fetch(`${API_PATH}/export/excel/filtered`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(filters)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Filtered export failed: ${response.status} ${text}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NagrikSetu_Filtered_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Filtered export error:', error);
    throw error;
  }
};
