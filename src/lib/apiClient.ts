import axios, { AxiosInstance } from "axios";
import { getSessionCookie } from "@/utils/cookies";

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
          const userData = localStorage.getItem("userData");
          let companyUniqueName = "";
          let country = "";

          if (userData) {
            try {
              const parsedData = JSON.parse(userData);
              companyUniqueName = parsedData.companyUniqueName;
            } catch (e) {
              console.error("Error parsing userData:", e);
            }
          }

          const storedCountry = sessionStorage.getItem("country");
          if (storedCountry) {
            country = storedCountry;
          }

          if (companyUniqueName) {
            const sessionId = getSessionCookie(companyUniqueName);
            if (sessionId) {
              config.headers["Session-Id"] = sessionId;
            }
          }

          if (country === "uk") {
            config.baseURL = process.env.NEXT_PUBLIC_API_URL_UK || process.env.NEXT_PUBLIC_API_URL;
          } else {
            config.baseURL = process.env.NEXT_PUBLIC_API_URL;
          }
        } else {
          config.baseURL = process.env.NEXT_PUBLIC_API_URL;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error("Unauthorized - Session may have expired");
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
