"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Додаткова перевірка при зміні маршруту
  useEffect(() => {
    if (!isLoading && !user && pathname.startsWith("/admin")) {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navigation = [
    {
      name: "До і Після",
      href: "/admin/before-after",
      description: "Завантаження фото до і після",
    },
    {
      name: "Звичайна галерея",
      href: "/admin/gallery",
      description: "Завантаження фото в галерею",
    },
    {
      name: "Управління даними",
      href: "/admin/data",
      description: "Перегляд, редагування та видалення фото",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навігація */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex justify-between w-full">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    Адмін панель
                  </h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        pathname === item.href
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобільна навігація */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === item.href
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Основний контент */}
      <main>{children}</main>
    </div>
  );
}
