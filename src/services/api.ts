// src/services/api.ts
import axios from "axios";

let API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bot-api-ff.vercel.app";

if (API_URL && !API_URL.startsWith("http")) {
  API_URL = `https://${API_URL}`;
}

const api = axios.create({
  baseURL: API_URL.endsWith("/") ? API_URL : `${API_URL}/`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
