import axios from "axios";

//const BASE_URL = "https://notevaultapi-production.up.railway.app";
const BASE_URL = "http://localhost:3000";

const api = axios.create({ baseURL: BASE_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nv_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerUser = (formData: FormData) =>
  api.post("/api/v1/auth/register", formData);

export const loginUser = (email: string, password: string) =>
  api.post("/api/v1/auth/login", { email, password });

export const getMe = () => api.get("/api/v1/auth/me");

export const updateMe = (formData: FormData) =>
  api.put("/api/v1/auth/me", formData);

// Password Reset
export const forgotPassword = (email: string) =>
  api.post("/api/v1/auth/forgot-password", { email });

export const resetPassword = (token: string, password: string) =>
  api.post(`/api/v1/auth/reset-password/${token}`, { password });

// ─── Users ───────────────────────────────────────────────────────────────────

export const discoverUsers = (params?: {
  search?: string;
  limit?: number;
  skip?: number;
}) => api.get("/api/v1/users/discover", { params });

export const getUserProfile = (userId: string) =>
  api.get(`/api/v1/users/profile/${userId}`);

// ─── Docs ────────────────────────────────────────────────────────────────────


// ─── Notes ───────────────────────────────────────────────────────────────────

export const getAllNotes = (params?: {
  category?: string;
  status?: string;
  search?: string;
}) => api.get("/api/v1/notes", { params });

export const getMyNotes = (params?: {
  category?: string;
  status?: string;
  search?: string;
}) => api.get("/api/v1/notes/my", { params });

export const getSingleNote = (id: string) => api.get(`/api/v1/notes/${id}`);

export const createNote = (formData: FormData) =>
  api.post("/api/v1/notes", formData);

export const editNote = (id: string, formData: FormData) =>
  api.put(`/api/v1/notes/${id}`, formData);

export const deleteNote = (id: string) => api.delete(`/api/v1/notes/${id}`);

export const reorderNotes = (notes: { id: string; order: number }[]) =>
  api.patch("/api/v1/notes/reorder", { notes });

// ─── Discover ────────────────────────────────────────────────────────────────

export const discoverNotes = (params?: {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  skip?: number;
  userId?: string;        // ← NEW
}) => api.get("/api/v1/notes/discover", { params });

export const downloadNote = (id: string) =>
  api.get(`/api/v1/notes/download/${id}`, { responseType: "blob" });




export const getImageUrl = (filename: string) =>
  filename ? `${BASE_URL}/uploads/${filename}` : "";
