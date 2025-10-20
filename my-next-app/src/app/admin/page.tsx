"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Images, FileText, Settings, BarChart3, Home } from "lucide-react";

export default function AdminDashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Тимчасово відключено для тестування
    // if (!loading && !isAuthenticated) {
    //   router.push("/login");
    // }
  }, [isAuthenticated, loading, router]);

  // Тимчасово відключено для тестування
  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

  const stats = [
    {
      name: "Hero блок",
      value: "1",
      icon: Home,
      href: "/admin/hero",
      color: "bg-red-500",
    },
    {
      name: "Загальна галерея",
      value: "0",
      icon: Images,
      href: "/admin/gallery",
      color: "bg-blue-500",
    },
    {
      name: "До/Після",
      value: "0",
      icon: Settings,
      href: "/admin/before-after",
      color: "bg-green-500",
    },
    {
      name: "Контент блоки",
      value: "0",
      icon: FileText,
      href: "/admin/content",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель управління</h1>
        <p className="mt-1 text-sm text-gray-500">
          Управління контентом та галереями
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(stat.href)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Швидкі дії
          </h3>
          <div className="mt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => router.push("/admin/gallery")}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Images className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  Управління галереєю
                </span>
              </button>

              <button
                onClick={() => router.push("/admin/before-after")}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Settings className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium text-gray-900">
                  До/Після галерея
                </span>
              </button>

              <button
                onClick={() => router.push("/admin/content")}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FileText className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">
                  Редагування контенту
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
