"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function DebugCookiesPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [cookies, setCookies] = useState<string>("");
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    setCookies(document.cookie);
  }, []);

  const testApiCall = async () => {
    try {
      const response = await fetch("/api/v1/content", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setTestResult({ status: response.status, data });
    } catch (error) {
      setTestResult({ error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug Cookies</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Cookies в браузері:
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {cookies || "Немає cookies"}
          </pre>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Контекст авторизації:
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(
              {
                isAuthenticated,
                user: user ? { id: user.id, email: user.email } : null,
                token: token ? `${token.substring(0, 20)}...` : null,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Тест API виклику:
          </h2>
          <button
            onClick={testApiCall}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Тестувати API виклик
          </button>
          {testResult && (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mt-4">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Інструкції:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>
              Спочатку увійдіть в систему через{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                /login
              </a>
            </li>
            <li>Поверніться на цю сторінку</li>
            <li>Перевірте чи з'явилися cookies</li>
            <li>Натисніть "Тестувати API виклик"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
