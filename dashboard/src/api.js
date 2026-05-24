import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getCustomers = () => axios.get(`${API_BASE}/api/customers`);

export const getStats = () => axios.get(`${API_BASE}/api/stats`);

export const getSettings = () => axios.get(`${API_BASE}/api/settings`);

export const updateSettings = (data) => axios.post(`${API_BASE}/api/settings`, data);

export const getExplanation = (id) => axios.get(`${API_BASE}/api/explain/${id}`);

