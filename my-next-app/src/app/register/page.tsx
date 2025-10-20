"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";
import { UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) {
      newErrors.email = "Email обов'язковий";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Невірний формат email";
    }

    if (!password) {
      newErrors.password = "Пароль обов'язковий";
    } else if (password.length < 6) {
      newErrors.password = "Пароль має бути мінімум 6 символів";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Підтвердження паролю обов'язкове";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Паролі не співпадають";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await authApi.register(email, password);
      toast.success(
        "Адміністратор успішно створено! Тепер можете увійти в систему."
      );
      router.push("/login");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Помилка створення адміністратора";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Створення адміністратора
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Заповніть дані для створення адміністратора
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              error={errors.email}
              disabled={loading}
            />

            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль"
                error={errors.password}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Підтвердіть пароль"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Підтвердіть пароль"
                error={errors.confirmPassword}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Створити адміністратора
          </Button>

          <div className="text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Повернутися до входу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

