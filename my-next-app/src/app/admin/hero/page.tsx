"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { heroApi, HeroBlock } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Save, Edit, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function HeroPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const api = useApi();
  const [heroBlock, setHeroBlock] = useState<HeroBlock | null>(null);
  const [loadingHero, setLoadingHero] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Форма для Hero блоку
  const [heroForm, setHeroForm] = useState({
    title: "",
    subtitle: "",
    backgroundImage: "",
  });

  useEffect(() => {
    loadHeroBlock();
  }, []);

  const loadHeroBlock = async () => {
    try {
      setLoadingHero(true);
      const response = await heroApi.get();
      setHeroBlock(response.data);
      setHeroForm({
        title: response.data.title,
        subtitle: response.data.subtitle,
        backgroundImage: response.data.backgroundImage || "",
      });
    } catch (error) {
      console.log("Hero блок не знайдено, створюємо новий");
      setHeroBlock(null);
    } finally {
      setLoadingHero(false);
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (heroBlock) {
        // Оновлюємо існуючий
        await heroApi.update(heroForm);
        toast.success("Hero блок оновлено");
      } else {
        // Створюємо новий
        await heroApi.create(heroForm);
        toast.success("Hero блок створено");
      }
      loadHeroBlock();
    } catch (error) {
      console.error("Помилка збереження Hero блоку:", error);
      toast.error("Помилка збереження Hero блоку");
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setHeroForm({ ...heroForm, backgroundImage: response.data.url });
      toast.success("Зображення завантажено");
    } catch (error) {
      console.error("Помилка завантаження зображення:", error);
      toast.error("Помилка завантаження зображення");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteHero = async () => {
    if (!confirm("Ви впевнені, що хочете видалити Hero блок?")) return;

    try {
      await heroApi.delete();
      toast.success("Hero блок видалено");
      setHeroBlock(null);
      setHeroForm({ title: "", subtitle: "", backgroundImage: "" });
    } catch (error) {
      console.error("Помилка видалення Hero блоку:", error);
      toast.error("Помилка видалення Hero блоку");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loadingHero) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження Hero блоку...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero блок</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управління головним блоком сайту
          </p>
        </div>
        {heroBlock && (
          <Button
            onClick={handleDeleteHero}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Видалити Hero</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма редагування */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {heroBlock ? "Редагувати Hero блок" : "Створити Hero блок"}
            </h3>
            <form onSubmit={handleSaveHero} className="space-y-4">
              <Input
                label="Заголовок (H1)"
                value={heroForm.title}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, title: e.target.value })
                }
                placeholder="RekoGrinik – Rekonstrukce bytů a domů v Praze"
                required
              />

              <Textarea
                label="Підзаголовок"
                value={heroForm.subtitle}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, subtitle: e.target.value })
                }
                placeholder="Kompletní rekonstrukce na klíč, pevné rozpočty a termíny"
                rows={3}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фонове зображення (опціонально)
                </label>
                {heroForm.backgroundImage ? (
                  <div className="space-y-2">
                    <img
                      src={heroForm.backgroundImage}
                      alt="Фонове зображення"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setHeroForm({ ...heroForm, backgroundImage: "" })
                      }
                    >
                      Видалити зображення
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Натисніть для завантаження
                            </span>{" "}
                            або перетягніть
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG (MAX. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                      accept="image/png, image/jpeg"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="submit" className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{heroBlock ? "Оновити" : "Створити"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Попередній перегляд */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Попередній перегляд
            </h3>
            <div className="relative">
              {heroForm.backgroundImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-lg"
                  style={{
                    backgroundImage: `url(${heroForm.backgroundImage})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
                </div>
              )}
              <div
                className={`relative p-8 rounded-lg ${
                  heroForm.backgroundImage
                    ? "text-white"
                    : "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                }`}
              >
                <h1 className="text-3xl font-bold mb-4">
                  {heroForm.title || "Заголовок"}
                </h1>
                <p className="text-lg opacity-90">
                  {heroForm.subtitle || "Підзаголовок"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

