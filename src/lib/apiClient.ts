import axios, { AxiosInstance } from "axios";
import { getSessionCookie } from "@/utils/cookies";
import { config as appConfig } from "@/config";

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          // Extract company name from URL path (e.g., /PiyusssshhCompany/in/welcome)
          const pathParts = window.location.pathname.split("/").filter(Boolean);
          const companyName = pathParts[0]; // First part of path is company name

          let country = "";

          const storedCountry = sessionStorage.getItem("country");
          if (storedCountry) {
            country = storedCountry;
          }

          // Get session token from cookie only (companyName-session format)
          if (companyName) {
            const sessionId = getSessionCookie(companyName);
            if (sessionId) {
              config.headers["Session-Id"] = sessionId;
            }
          }

          if (country === "uk") {
            config.baseURL = appConfig.NEXT_PUBLIC_API_URL_UK;
          } else {
            config.baseURL = appConfig.NEXT_PUBLIC_API_URL;
          }
        } else {
          config.baseURL = appConfig.NEXT_PUBLIC_API_URL;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error("Unauthorized - Session expired");

          // Emit custom event for session expiry
          if (typeof window !== "undefined") {
            const event = new CustomEvent("session-expired");
            window.dispatchEvent(event);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient().getInstance();
