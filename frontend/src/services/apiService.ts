const API_URL = 'http://localhost:3000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error?.message || 'API_ERROR');
    }

    return result;
};