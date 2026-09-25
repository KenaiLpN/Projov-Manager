import axios from "axios";
import { validateJsonResponse } from "@/utils/apiResponse";
const finalBaseURL = "/api/proxy/";
const api = axios.create({
  baseURL: finalBaseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    // Downloads declarados explicitamente não seguem o contrato JSON.
    if (!response.config.responseType || response.config.responseType === "json") {
      validateJsonResponse(response.data, response.headers["content-type"], response.status);
    }
    return response;
  },
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
