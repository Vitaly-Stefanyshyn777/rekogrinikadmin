import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useMemo } from "react";

export const useApi = () => {
  const { token } = useAuth();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: "/api/v1",
      withCredentials: true,
    });

    // Додаємо токен до запитів
    instance.interceptors.request.use((config) => {
      console.log("🌐 useApi запит:", config.url);
      console.log("🔑 useApi токен:", token ? "є" : "немає");
      console.log("📝 useApi повний токен:", token);

      // Отримуємо токен з localStorage як резервний варіант
      const localStorageToken = localStorage.getItem("accessToken");
      const finalToken = token || localStorageToken;

      console.log(
        "🔑 useApi localStorage токен:",
        localStorageToken ? "є" : "немає"
      );
      console.log("🔑 useApi фінальний токен:", finalToken ? "є" : "немає");

      if (finalToken) {
        config.headers.Authorization = `Bearer ${finalToken}`;
        console.log(
          "✅ useApi додано заголовок Authorization:",
          `Bearer ${finalToken.substring(0, 20)}...`
        );
        console.log("📋 useApi заголовки:", config.headers);
      } else {
        console.log("❌ useApi токен відсутній, запит без авторизації");
      }
      return config;
    });

    // Додаємо обробку помилок
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(
          "API помилка:",
          error.response?.status,
          error.response?.data
        );
        return Promise.reject(error);
      }
    );

    return instance;
  }, [token]);

  return api;
};
