import axios from "axios";
const isDev = process.env.NODE_ENV !== "production";
let API_URL = "";
if (isDev) {
  API_URL = "/api/proxy";
} else {
  API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "https://bot-api-ff.vercel.app"
  ).trim();
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        localStorage.removeItem("projov_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;