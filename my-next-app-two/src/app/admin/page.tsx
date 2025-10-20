"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Image, ArrowLeftRight, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      name: "Галерея",
      href: "/admin/gallery",
      icon: Image,
      description: "Управління зображеннями",
    },
    {
      name: "До/Після",
      href: "/admin/before-after",
      icon: ArrowLeftRight,
      description: "Парні зображення",
    },
    {
      name: "Контент",
      href: "/admin/content",
      icon: FileText,
      description: "Текстові блоки",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель управління</h1>
        <p className="text-gray-600">Ласкаво просимо, {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {stat.name}
                </h3>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href={stat.href}>
                <Button className="w-full">Перейти до {stat.name}</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Швидкі дії</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/gallery">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center"
            >
              <Upload className="h-6 w-6 mb-2" />
              <span>Завантажити фото</span>
            </Button>
          </Link>
          <Link href="/admin/content">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center"
            >
              <FileText className="h-6 w-6 mb-2" />
              <span>Редагувати Hero</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
