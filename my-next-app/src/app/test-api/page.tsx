"use client";

import React, { useState } from "react";
import { authApi } from "@/lib/api";

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("Тестуємо логін...");
      const response = await authApi.login(
        "admin@example.com",
        "R3k0gr1n1k@Admin#2024"
      );
      console.log("Відповідь:", response.data);
      setResult({ success: true, data: response.data });
    } catch (error: any) {
      console.error("Помилка:", error);
      setResult({
        success: false,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Test API</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Тест логіну:
          </h2>
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Тестування..." : "Тестувати логін"}
          </button>
        </div>

        {result && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Результат:
            </h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

