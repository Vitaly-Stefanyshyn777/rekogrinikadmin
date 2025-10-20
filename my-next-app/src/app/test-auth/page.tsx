"use client";

import React, { useState } from "react";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function TestAuthPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("R3k0gr1n1k@Admin#2024");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await authApi.login(email, password);
      setResult(response.data);
      toast.success("Успішно увійшли!");
    } catch (error: any) {
      setResult({ error: error.response?.data || error.message });
      toast.error("Помилка входу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Тест авторизації
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Входимо..." : "Увійти"}
          </button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="font-medium">Результат:</h3>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

