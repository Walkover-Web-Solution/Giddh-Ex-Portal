import axios, { AxiosInstance } from "axios";
import { HttpStatus } from "@/constants/httpStatus";
import { getSessionCookie } from "@/utils/cookies";
import { getConfig } from "@/config";

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
        const appConfig = getConfig();

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
            config.baseURL = appConfig.API_URL_UK;
          } else {
            config.baseURL = appConfig.API_URL;
          }
        } else {
          config.baseURL = appConfig.API_URL;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === HttpStatus.UNAUTHORIZED ||
          error.response?.status === HttpStatus.FORBIDDEN
        ) {
          // Do not show session-expired modal on public routes (guest view, no session expected)
          const publicRoutes = [
            "/invoice/preview",
            "/payment/preview",
            "/invoice-pay",
            "/auth",
            "/login",
          ];
          const pathname = typeof window !== "undefined" ? window.location.pathname : "";
          const isPublicRoute = publicRoutes.some((route) => pathname.includes(route));

          if (!isPublicRoute) {
            console.error("Unauthorized - Session expired");
            if (typeof window !== "undefined") {
              const event = new CustomEvent("session-expired");
              window.dispatchEvent(event);
            }
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
