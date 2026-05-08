import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getCustomers = () => axios.get(`${API_BASE}/api/customers`);

export const getExplanation = (id) => axios.get(`${API_BASE}/api/explain/${id}`);

