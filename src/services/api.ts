// src/services/api.ts
import axios from "axios";

let API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bot-api-ff.vercel.app";

// Remove espaços extras que podem vir do arquivo .env
API_URL = API_URL.trim();

if (API_URL && !API_URL.startsWith("http")) {
  API_URL = `https://${API_URL}`;
}

const finalBaseURL = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;

// Isso ajudará a diagnosticar o erro diretamente no console do navegador do usuário
console.log("Configurando API BaseURL:", finalBaseURL);

const api = axios.create({
  baseURL: finalBaseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
