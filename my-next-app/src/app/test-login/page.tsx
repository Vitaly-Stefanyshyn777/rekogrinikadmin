"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function TestLoginPage() {
  const { login, user, token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTestLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const success = await login("admin@example.com", "R3k0gr1n1k@Admin#2024");
      setResult({ success, user, token, isAuthenticated });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Login</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Поточний стан:
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
            Тест логіну:
          </h2>
          <button
            onClick={handleTestLogin}
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

