import axios from "axios";

const API_BASE = "http://localhost:8000";

export const getCustomers = () => axios.get(`${API_BASE}/api/customers`);

export const getExplanation = (id) => axios.get(`${API_BASE}/api/explain/${id}`);

