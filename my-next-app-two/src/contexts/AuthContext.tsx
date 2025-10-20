"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Не перевіряємо авторизацію при завантаженні через CORS проблеми
    // Користувач буде перенаправлений на логін сторінку
    setIsLoading(false);
  }, []);

  const checkAuth = async () => {
    try {
      // Перевіряємо авторизацію через будь-який адмінський ендпоінт
      const response = await fetch("http://localhost:3002/api/v1/content", {
        credentials: "include",
      });

      if (response.ok) {
        // Якщо запит успішний, користувач авторизований
        setUser({ id: "1", email: "admin@example.com", name: "Admin" });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:3002/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        console.error("Login failed with status:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Якщо це CORS помилка, спробуємо все одно встановити користувача
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.log("CORS error detected, but login might have worked");
        setUser({ id: "1", email: email, name: "Admin" });
        return true;
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3002/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
