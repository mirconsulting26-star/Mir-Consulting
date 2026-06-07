import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
});

export const submitLead = (data) => api.post("/leads", data).then((r) => r.data);

export const adminLogin = (password) =>
    api.post("/admin/login", { password }).then((r) => r.data);

export const fetchLeads = (token) =>
    api
        .get("/admin/leads", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.data);

export const fetchStats = (token) =>
    api
        .get("/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.data);
