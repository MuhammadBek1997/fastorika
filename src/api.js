export const API_BASE = import.meta.env.VITE_API_URL || '';

export const apiFetch = (path, options) => {
  const url = `${API_BASE}${path}`;
  return fetch(url, options);
};