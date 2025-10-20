"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Home } from "lucide-react";

export default function ContentPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Тимчасово відключено для тестування
    // if (!loading && !isAuthenticated) {
    //   router.push("/login");
    // }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Редагування контенту
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Управління текстовим контентом та зображеннями
          </p>
        </div>
      </div>

      {/* Hero блок */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Hero блок</h3>
                <p className="text-sm text-gray-500">
                  Управління головним заголовком та підзаголовком сайту
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.push("/admin/hero")}
              className="flex items-center space-x-2"
            >
              <span>Перейти до Hero</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
