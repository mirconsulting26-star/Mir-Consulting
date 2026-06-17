import axios from "axios";
import { swrFetch, invalidateCache } from "./cache";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Cache keys to wipe when each entity type is mutated by admin.
const INVALIDATION_MAP = {
    post: ["posts", "works:all", "works:insight"],
    case_study: ["case_studies", "works:all", "works:case_study"],
    video: ["videos", "works:all", "works:video"],
    team: ["team"],
    site_settings: ["site_settings"],
};
const invalidate = (entity) => {
    (INVALIDATION_MAP[entity] || []).forEach(invalidateCache);
};

export const api = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
});

// ====== Global 401 interceptor (admin only) ======
// Token is held only in React state (see /pages/Admin.jsx) — no localStorage.
// On 401 from any admin route we simply route the user back to /admin; React
// remounts the page with empty state, which renders the login screen.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const config = error?.config || {};
        const url = (config.url || "").toString();
        const isAdminRoute = url.includes("/admin/") && !url.includes("/admin/login");
        if (status === 401 && isAdminRoute && typeof window !== "undefined") {
            if (!window.location.pathname.startsWith("/admin")) {
                window.location.assign("/admin");
            } else {
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// ====== PUBLIC ======
// All read-only public endpoints use stale-while-revalidate so cold-start
// pain on Render's free tier is masked once a visitor has hit the site once.
export const submitLead = (data) => api.post("/leads", data).then((r) => r.data);

export const subscribe = (data) => api.post("/subscribe", data).then((r) => r.data);

export const fetchPosts = (opts) =>
    swrFetch("posts", () => api.get("/posts").then((r) => r.data), opts);

export const fetchPost = (slug) =>
    swrFetch(`post:${slug}`, () => api.get(`/posts/${slug}`).then((r) => r.data));

export const fetchCaseStudies = (opts) =>
    swrFetch("case_studies", () => api.get("/case-studies").then((r) => r.data), opts);

export const fetchCaseStudy = (slug) =>
    swrFetch(`case_study:${slug}`, () =>
        api.get(`/case-studies/${slug}`).then((r) => r.data)
    );

export const fetchCompany = () =>
    swrFetch("company", () => api.get("/company").then((r) => r.data),
        { ttl: 60 * 60 * 1000 }); // 1h — rarely changes

// ====== AUTH ======
export const adminLogin = (password) =>
    api.post("/admin/login", { password }).then((r) => r.data);

export const forgotPassword = (email) =>
    api.post("/admin/forgot-password", { email }).then((r) => r.data);

export const validateResetToken = (token) =>
    api.get(`/admin/reset-password/${token}`).then((r) => r.data);

export const resetPassword = (token, new_password) =>
    api.post("/admin/reset-password", { token, new_password }).then((r) => r.data);

export const changePassword = (token, current_password, new_password) =>
    api
        .post(
            "/admin/change-password",
            { current_password, new_password },
            { headers: authHeader(token) }
        )
        .then((r) => r.data);

// ====== ADMIN: LEADS ======
export const fetchLeads = (token, params = {}) =>
    api
        .get("/admin/leads", { headers: authHeader(token), params })
        .then((r) => r.data);

export const fetchStats = (token) =>
    api.get("/admin/stats", { headers: authHeader(token) }).then((r) => r.data);

export const updateLead = (token, id, payload) =>
    api
        .patch(`/admin/leads/${id}`, payload, { headers: authHeader(token) })
        .then((r) => r.data);

export const deleteLead = (token, id) =>
    api
        .delete(`/admin/leads/${id}`, { headers: authHeader(token) })
        .then((r) => r.data);

// ====== ADMIN: POSTS ======
export const fetchAdminPosts = (token) =>
    api.get("/admin/posts", { headers: authHeader(token) }).then((r) => r.data);

export const createPost = (token, payload) =>
    api
        .post("/admin/posts", payload, { headers: authHeader(token) })
        .then((r) => { invalidate("post"); return r.data; });

export const updatePost = (token, id, payload) =>
    api
        .put(`/admin/posts/${id}`, payload, { headers: authHeader(token) })
        .then((r) => { invalidate("post"); invalidateCache(`post:${payload.slug || ""}`); return r.data; });

export const deletePost = (token, id) =>
    api
        .delete(`/admin/posts/${id}`, { headers: authHeader(token) })
        .then((r) => { invalidate("post"); return r.data; });

// ====== ADMIN: CASE STUDIES ======
export const fetchAdminCaseStudies = (token) =>
    api
        .get("/admin/case-studies", { headers: authHeader(token) })
        .then((r) => r.data);

export const createCaseStudy = (token, payload) =>
    api
        .post("/admin/case-studies", payload, { headers: authHeader(token) })
        .then((r) => { invalidate("case_study"); return r.data; });

export const updateCaseStudy = (token, id, payload) =>
    api
        .put(`/admin/case-studies/${id}`, payload, {
            headers: authHeader(token),
        })
        .then((r) => { invalidate("case_study"); invalidateCache(`case_study:${payload.slug || ""}`); return r.data; });

export const deleteCaseStudy = (token, id) =>
    api
        .delete(`/admin/case-studies/${id}`, { headers: authHeader(token) })
        .then((r) => { invalidate("case_study"); return r.data; });

// ====== ADMIN: INVOICES ======
export const fetchAdminInvoices = (token, params = {}) =>
    api
        .get("/admin/invoices", { headers: authHeader(token), params })
        .then((r) => r.data);

export const createInvoice = (token, payload) =>
    api
        .post("/admin/invoices", payload, { headers: authHeader(token) })
        .then((r) => r.data);

export const updateInvoice = (token, id, payload) =>
    api
        .put(`/admin/invoices/${id}`, payload, { headers: authHeader(token) })
        .then((r) => r.data);

export const deleteInvoice = (token, id) =>
    api
        .delete(`/admin/invoices/${id}`, { headers: authHeader(token) })
        .then((r) => r.data);

export const sendInvoiceEmail = (token, id) =>
    api
        .post(`/admin/invoices/${id}/send`, {}, { headers: authHeader(token) })
        .then((r) => r.data);

export const invoicePdfUrl = (id, token) =>
    `${API}/admin/invoices/${id}/pdf?_t=${encodeURIComponent(token)}`;

export const downloadInvoicePdf = async (token, id, number) => {
    const res = await api.get(`/admin/invoices/${id}/pdf`, {
        headers: authHeader(token),
        responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${number || "invoice"}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

export const publicInvoiceUrl = (token) =>
    `${BACKEND_URL.replace(/\/$/, "")}/api/invoices/public/${token}/pdf`;

export const fetchEmailStatus = (token) =>
    api.get("/admin/email-status", { headers: authHeader(token) }).then((r) => r.data);

// ====== PUBLIC: TEAM / VIDEOS / WORKS / SITE SETTINGS ======
export const fetchTeam = (opts) =>
    swrFetch("team", () => api.get("/team").then((r) => r.data), opts);

export const fetchTeamMember = (slug) =>
    swrFetch(`team:${slug}`, () => api.get(`/team/${slug}`).then((r) => r.data));

export const fetchVideos = (opts) =>
    swrFetch("videos", () => api.get("/videos").then((r) => r.data), opts);

export const fetchVideo = (slug) =>
    swrFetch(`video:${slug}`, () => api.get(`/videos/${slug}`).then((r) => r.data));

export const fetchWorks = (type, opts) =>
    swrFetch(
        `works:${type || "all"}`,
        () => api.get("/works", { params: type ? { type } : {} }).then((r) => r.data),
        opts
    );

export const fetchSiteSettings = () =>
    swrFetch("site_settings", () => api.get("/site-settings").then((r) => r.data),
        { ttl: 30 * 60 * 1000 }); // 30 min

// ====== ADMIN: TEAM ======
export const fetchAdminTeam = (token) =>
    api.get("/admin/team", { headers: authHeader(token) }).then((r) => r.data);
export const createTeamMember = (token, payload) =>
    api.post("/admin/team", payload, { headers: authHeader(token) })
        .then((r) => { invalidate("team"); return r.data; });
export const updateTeamMember = (token, id, payload) =>
    api.put(`/admin/team/${id}`, payload, { headers: authHeader(token) })
        .then((r) => { invalidate("team"); return r.data; });
export const deleteTeamMember = (token, id) =>
    api.delete(`/admin/team/${id}`, { headers: authHeader(token) })
        .then((r) => { invalidate("team"); return r.data; });

// ====== ADMIN: VIDEOS ======
export const fetchAdminVideos = (token) =>
    api.get("/admin/videos", { headers: authHeader(token) }).then((r) => r.data);
export const createVideo = (token, payload) =>
    api.post("/admin/videos", payload, { headers: authHeader(token) })
        .then((r) => { invalidate("video"); return r.data; });
export const updateVideo = (token, id, payload) =>
    api.put(`/admin/videos/${id}`, payload, { headers: authHeader(token) })
        .then((r) => { invalidate("video"); invalidateCache(`video:${payload.slug || ""}`); return r.data; });
export const deleteVideo = (token, id) =>
    api.delete(`/admin/videos/${id}`, { headers: authHeader(token) })
        .then((r) => { invalidate("video"); return r.data; });

// ====== ADMIN: SITE SETTINGS ======
export const updateSiteSettings = (token, payload) =>
    api.put("/admin/site-settings", payload, { headers: authHeader(token) })
        .then((r) => { invalidate("site_settings"); return r.data; });

export const verifyGitHubStorage = (token) =>
    api.get("/admin/media/verify-github", { headers: authHeader(token) }).then((r) => r.data);

// ====== ADMIN: LEADS CSV EXPORT ======
export const downloadLeadsCsv = async (token) => {
    const res = await api.get("/admin/leads-export.csv", {
        headers: authHeader(token),
        responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mir-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

// ====== ADMIN: SUBSCRIBERS ======
export const fetchSubscribers = (token) =>
    api.get("/admin/subscribers", { headers: authHeader(token) }).then((r) => r.data);

export const deleteSubscriber = (token, id) =>
    api.delete(`/admin/subscribers/${id}`, { headers: authHeader(token) }).then((r) => r.data);

export const downloadSubscribersCsv = async (token) => {
    const res = await api.get("/admin/subscribers-export.csv", {
        headers: authHeader(token),
        responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mir-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

// ====== PUBLIC INVOICE + MANUAL PAYMENT CONFIRMATION ======
export const fetchPublicInvoice = (publicToken) =>
    api.get(`/invoices/public/${publicToken}`).then((r) => r.data);
export const submitPaymentConfirmation = (publicToken, payload) =>
    api
        .post(`/invoices/public/${publicToken}/confirm-payment`, payload)
        .then((r) => r.data);
export const markInvoicePaid = (token, id) =>
    api
        .post(`/admin/invoices/${id}/mark-paid`, {}, { headers: authHeader(token) })
        .then((r) => r.data);

// ====== ADMIN: TRANSLATE ======
export const adminTranslate = (token, text, target_lang, source_lang = "auto") =>
    api
        .post(
            "/admin/translate",
            { text, target_lang, source_lang },
            { headers: authHeader(token) },
        )
        .then((r) => r.data);

