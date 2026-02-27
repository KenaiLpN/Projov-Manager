// src/services/api.ts
import axios from "axios";

const API_URL = "https://bot-api-ff.vercel.app";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Aumentei para 10s, servidores gratuitos (Vercel/Render) podem demorar para "acordar" (Cold Start)
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  // Atenção aqui: 'withCredentials: true' só é necessário se você estiver usando Cookies/Sessão.
  // Se for autenticação via Token (Bearer) no header, pode remover essa linha para evitar erros de CORS chatos.
});

export default api;
