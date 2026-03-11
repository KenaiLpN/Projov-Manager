// src/services/api.ts
import axios from "axios";

// Em desenvolvimento, usamos o proxy do Next.js (/api/proxy) para evitar CORS:
// o browser faz uma requisição same-origin para o Next.js, que repassa server-side.
// Em produção, apontamos direto para a API.
const isDev = process.env.NODE_ENV !== "production";

// Lógica de fallback robusta:
// Em dev FORÇAR usar o '/api/proxy' mesmo se tiver `.env` preenchido.
let API_URL = "";

if (isDev) {
  API_URL = "/api/proxy";
} else {
  // Em produção, usa a variável de ambiente, ou a URL padrão.
  API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "https://bot-api-ff.vercel.app"
  ).trim();

  // Garante o http(s) em produção se esquecer
  if (API_URL && !API_URL.startsWith("http")) {
    API_URL = `https://${API_URL}`;
  }
}

const finalBaseURL = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;

if (isDev) {
  console.log("Configurando API BaseURL (proxy local):", finalBaseURL);
}

const api = axios.create({
  baseURL: finalBaseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
