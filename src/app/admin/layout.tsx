"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

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
      name: "Управління контентом",
      href: "/admin/content",
      description: "Секції сайту (Hero тощо)",
    },
    {
      name: "Заявки форми",
      href: "/admin/forms",
      description: "Перегляд відправлених заявок",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навігація */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex justify-between w-full">
              <div className="flex items-center">
                {/* Burger button on mobile (left) */}
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="md:hidden mr-2 inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                  aria-label="Open menu"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                {/* Desktop nav */}
                <div className="hidden md:ml-6 md:flex md:space-x-8">
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
              {/* Right block: email + logout spaced */}
              <div className="flex items-center w-56 justify-between">
                <span className="text-sm text-gray-600 truncate">
                  {user.email}
                </span>
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

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/25"
            onClick={() => setMobileOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Меню</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    {item.description}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Основний контент */}
      <main>{children}</main>
    </div>
  );
}
