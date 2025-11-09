export const API_BASE = import.meta.env.VITE_API_URL || '';

// Adds optional Authorization header from sessionStorage/env and sensible defaults
export const apiFetch = async (path, options = {}) => {
  const defaultHeaders = {
    Accept: 'application/json',
  };
  // Prefer Bearer token from sessionStorage; fallback to env auth string
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const envAuth = import.meta.env.VITE_API_AUTH; // e.g., "Basic xxx" or "Bearer yyy"
  if (!options.headers?.Authorization) {
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else if (envAuth) {
      defaultHeaders['Authorization'] = envAuth;
    }
  }

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  return fetch(`${API_BASE}${path}`, mergedOptions);
};

// Fetch cards by userId
export const getUserCards = async (userId) => {
  if (!userId) throw new Error('userId is required');
  const res = await apiFetch(`cards/user/${userId}`, { method: 'GET' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to load cards');
  }
  return data; // Expect array of cards
};