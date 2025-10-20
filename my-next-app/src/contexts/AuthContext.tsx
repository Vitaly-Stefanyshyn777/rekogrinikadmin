"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, User } from "@/lib/api";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Перевіряємо чи користувач авторизований при завантаженні
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Перевіряємо чи є токен в localStorage
      const savedToken = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (
        savedToken &&
        savedUser &&
        savedToken !== "undefined" &&
        savedToken !== "null"
      ) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        console.log("Токен відновлено з localStorage:", savedToken);
        console.log("Перевірка токена в checkAuth:", savedToken);
        console.log(
          "Перевірка всіх ключів localStorage в checkAuth:",
          Object.keys(localStorage)
        );
      } else {
        console.log("❌ Токен або користувач відсутні в localStorage");
        console.log("savedToken:", savedToken);
        console.log("savedUser:", savedUser);
        // Очищаємо неправильні дані
        if (savedToken === "undefined" || savedToken === "null") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Помилка відновлення токену:", error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Спроба логіну...");
      const response = await authApi.login(email, password);
      console.log("Відповідь логіну:", response.data);

      // Перевіряємо чи токен валідний
      if (
        !response.data.accessToken ||
        response.data.accessToken === "undefined"
      ) {
        throw new Error("Невалідний токен отримано від сервера");
      }

      // Зберігаємо в state
      setUser(response.data.user);
      setToken(response.data.accessToken);

      // Зберігаємо в localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      console.log("Токен збережено в localStorage:", response.data.accessToken);
      console.log(
        "Перевірка localStorage:",
        localStorage.getItem("accessToken")
      );
      console.log(
        "Перевірка всіх ключів localStorage:",
        Object.keys(localStorage)
      );

      toast.success("Успішно ввійшли в систему");
      return true;
    } catch (error: any) {
      console.error("Помилка логіну:", error);
      const message = error.response?.data?.message || "Помилка входу";
      toast.error(message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();

      // Очищаємо state
      setUser(null);
      setToken(null);

      // Очищаємо localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      console.log("Токен видалено з localStorage");

      toast.success("Ви вийшли з системи");
    } catch (error) {
      console.error("Помилка виходу:", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    token,
    login,
    logout,
    isAuthenticated: !!user,
  };

  console.log("AuthContext state:", { user, token, isAuthenticated: !!user });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
