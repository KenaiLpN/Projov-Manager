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
export default api;