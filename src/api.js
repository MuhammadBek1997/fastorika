export const API_BASE = import.meta.env.VITE_API_URL || '';

export const apiFetch = async (path, options = {}) => {
  const isDev = import.meta.env.DEV;
  // In dev, always use relative path so Vite proxy handles CORS.
  if (isDev) {
    return fetch(path, options);
  }

  const url = `${API_BASE}${path}`;
  try {
    return await fetch(url, options);
  } catch (err) {
    // Fallback: try relative path if absolute fails (rare in prod)
    return await fetch(path, options);
  }
};