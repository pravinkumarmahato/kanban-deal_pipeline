import { API_BASE_URL } from '../constants';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.hash = '#/login';
      throw new Error('Unauthorized');
    }
    const errorText = await response.text();
    throw new Error(errorText || 'API Error');
  }
  return response.json();
};

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
  
  me: async () => {
    const res = await fetch(`${API_BASE_URL}/users/me`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createUser: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Deals
  getDeals: async () => {
    const res = await fetch(`${API_BASE_URL}/deals`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createDeal: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/deals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateDeal: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/deals/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteDeal: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/deals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
        throw new Error('Unauthorized');
      }
      const errorText = await res.text();
      throw new Error(errorText || 'API Error');
    }
    if (res.status === 204) {
      return null; // No content
    }
    return res.json();
  },

  getDealActivities: async (dealId: number) => {
    const res = await fetch(`${API_BASE_URL}/activities/deal/${dealId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Memos
  getMemoByDeal: async (dealId: number) => {
    const res = await fetch(`${API_BASE_URL}/memos/deal/${dealId}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  
  createMemo: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/memos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateMemo: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/memos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getMemoVersions: async (memoId: number) => {
    const res = await fetch(`${API_BASE_URL}/memos/${memoId}/versions`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Partner actions
  addComment: async (dealId: number, comment: string) => {
    const res = await fetch(`${API_BASE_URL}/activities/comment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ deal_id: dealId, comment }),
    });
    return handleResponse(res);
  },

  voteOnDeal: async (dealId: number) => {
    const res = await fetch(`${API_BASE_URL}/activities/deal/${dealId}/vote`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getUserVote: async (dealId: number) => {
    const res = await fetch(`${API_BASE_URL}/activities/deal/${dealId}/vote`, { headers: getHeaders() });
    if (!res.ok) {
      if (res.status === 404) {
        return null; // User hasn't voted yet
      }
      throw new Error('Failed to get vote status');
    }
    return handleResponse(res);
  },

  approveDeal: async (dealId: number) => {
    const res = await fetch(`${API_BASE_URL}/activities/deal/${dealId}/approve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  declineDeal: async (dealId: number) => {
    const res = await fetch(`${API_BASE_URL}/activities/deal/${dealId}/decline`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  }
};
