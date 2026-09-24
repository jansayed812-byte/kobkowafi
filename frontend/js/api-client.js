/**
 * API Client - Handle all backend communication
 */

const APIClient = (() => {
  const API_BASE_URL = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000/api/v1';
  let token = localStorage.getItem('authToken');
  let refreshToken = localStorage.getItem('refreshToken');

  const defaultHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  });

  const handleResponse = async (response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  };

  const request = async (method, endpoint, data = null) => {
    const options = {
      method,
      headers: defaultHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

      if (response.status === 401) {
        // Token expired, try to refresh
        if (await refreshAccessToken()) {
          return request(method, endpoint, data);
        }
        // Refresh failed, logout
        logout();
        throw new Error('Session expired');
      }

      return handleResponse(response);
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        token = data.data.token;
        localStorage.setItem('authToken', token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const setToken = (newToken, newRefreshToken) => {
    token = newToken;
    refreshToken = newRefreshToken;
    localStorage.setItem('authToken', newToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
  };

  const logout = () => {
    token = null;
    refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  };

  return {
    setApiBaseUrl: (url) => {
      localStorage.setItem('apiBaseUrl', url);
    },

    // Auth endpoints
    auth: {
      register: (email, password) =>
        request('POST', '/auth/register', { email, password }),
      login: (email, password) =>
        request('POST', '/auth/login', { email, password }),
      getProfile: () => request('GET', '/auth/profile'),
      changePassword: (oldPassword, newPassword) =>
        request('POST', '/auth/change-password', { oldPassword, newPassword }),
      generateApiKey: () => request('POST', '/auth/api-key'),
    },

    // Operations endpoints
    operations: {
      create: (data) => request('POST', '/operations', data),
      list: (page = 1, pageSize = 10) =>
        request('GET', `/operations?page=${page}&pageSize=${pageSize}`),
      get: (id) => request('GET', `/operations/${id}`),
      start: (id, config) =>
        request('POST', `/operations/${id}/start`, config),
      pause: (id) => request('POST', `/operations/${id}/pause`),
      resume: (id) => request('POST', `/operations/${id}/resume`),
      cancel: (id) => request('POST', `/operations/${id}/cancel`),
      delete: (id) => request('DELETE', `/operations/${id}`),
      getResults: (id, page = 1, pageSize = 50) =>
        request('GET', `/operations/${id}/results?page=${page}&pageSize=${pageSize}`),
      getLogs: (id, page = 1, pageSize = 50) =>
        request('GET', `/operations/${id}/logs?page=${page}&pageSize=${pageSize}`),
    },

    // Targets endpoints
    targets: {
      create: (data) => request('POST', '/targets', data),
      list: (page = 1, pageSize = 10) =>
        request('GET', `/targets?page=${page}&pageSize=${pageSize}`),
      get: (id) => request('GET', `/targets/${id}`),
      byProtocol: (protocol) =>
        request('GET', `/targets/protocol/${protocol}`),
      update: (id, data) => request('PUT', `/targets/${id}`, data),
      delete: (id) => request('DELETE', `/targets/${id}`),
    },

    // Wordlists endpoints
    wordlists: {
      create: (data, file) => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        formData.append('file', file);

        return fetch(`${API_BASE_URL}/wordlists/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }).then(handleResponse);
      },
      list: (page = 1, pageSize = 10) =>
        request('GET', `/wordlists?page=${page}&pageSize=${pageSize}`),
      get: (id) => request('GET', `/wordlists/${id}`),
      getContent: (id, limit = 1000, offset = 0) =>
        request('GET', `/wordlists/${id}/content?limit=${limit}&offset=${offset}`),
      update: (id, data) => request('PUT', `/wordlists/${id}`, data),
      download: (id) =>
        fetch(`${API_BASE_URL}/wordlists/${id}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      delete: (id) => request('DELETE', `/wordlists/${id}`),
      getUsage: () => request('GET', '/wordlists/usage/total'),
    },

    // Settings endpoints
    settings: {
      get: () => request('GET', '/settings'),
      update: (data) => request('PUT', '/settings', data),
      setTheme: (theme) =>
        request('POST', `/settings/theme/${theme}`),
      setNotifications: (enabled) =>
        request('POST', `/settings/notifications/${enabled}`),
      reset: () => request('POST', '/settings/reset'),
    },

    // System endpoints
    system: {
      getHealth: () =>
        fetch(`${API_BASE_URL.replace('/api/v1', '')}/system/health`).then(
          handleResponse,
        ),
      getStatus: () =>
        request('GET', '/system/status'),
      getMetrics: () =>
        request('GET', '/system/metrics'),
    },

    setToken,
    logout,
    getToken: () => token,
    isAuthenticated: () => !!token,
  };
})();

// Export for use
window.APIClient = APIClient;
