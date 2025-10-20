"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { galleryApi, Album, BeforeAfterPair } from "@/lib/api";
import { Photo } from "../../../../shared-types";
import { GroupedPhotos } from "@/components/GroupedPhotos";
import {
  Plus,
  Upload,
  Trash2,
  ArrowRight,
  Image as ImageIcon,
  Grid,
  List,
} from "lucide-react";
import toast from "react-hot-toast";

export default function BeforeAfterPage() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pairs, setPairs] = useState<BeforeAfterPair[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [showAddPair, setShowAddPair] = useState(false);
  const [uploadingPair, setUploadingPair] = useState(false);

  // Стан для 6 фото (3 ДО + 3 ПІСЛЯ)
  const [beforePhotos, setBeforePhotos] = useState<Photo[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState<boolean[]>(
    new Array(6).fill(false)
  );

  // Стан для групування
  const [groupBy, setGroupBy] = useState<"tag" | "pair">("tag");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Завантажуємо альбоми тільки якщо є валідний токен
    if (token && token !== "undefined" && token !== "null") {
      console.log("Компонент завантажується, починаємо завантаження альбомів");
      loadAlbums();
    } else {
      console.log("Токен невалідний, пропускаємо завантаження альбомів");
    }
  }, [token]);

  useEffect(() => {
    if (selectedAlbum) {
      loadPhotos(selectedAlbum.id.toString());
      loadPairs(selectedAlbum.id.toString());
    }
  }, [selectedAlbum]);

  const loadAlbums = async () => {
    try {
      setLoadingAlbums(true);
      console.log("Завантаження альбомів...");
      console.log("🔑 Токен для запиту:", token);

      // Перевіряємо чи токен валідний
      if (!token || token === "undefined" || token === "null") {
        throw new Error("Токен невалідний");
      }

      const response = await fetch("/api/v1/gallery/albums", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Помилка завантаження альбомів");
      }

      const albumsData = await response.json();
      console.log("Відповідь API:", albumsData);
      const beforeAfterAlbums = albumsData.filter(
        (album: any) => album.type === "BEFORE_AFTER"
      );
      console.log("Фільтровані альбоми:", beforeAfterAlbums);
      setAlbums(beforeAfterAlbums);
      if (beforeAfterAlbums.length > 0 && !selectedAlbum) {
        setSelectedAlbum(beforeAfterAlbums[0]);
        console.log("Встановлено вибраний альбом:", beforeAfterAlbums[0]);
      }
    } catch (error) {
      console.error("Помилка завантаження альбомів:", error);
      toast.error("Помилка завантаження альбомів");
    } finally {
      setLoadingAlbums(false);
    }
  };

  const loadPhotos = async (albumId: string) => {
    try {
      setLoadingPhotos(true);
      const response = await fetch(`/api/v1/gallery/albums/${albumId}/photos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Помилка завантаження фото");
      }

      const photosData = await response.json();
      setPhotos(photosData);
    } catch (error) {
      toast.error("Помилка завантаження фото");
    } finally {
      setLoadingPhotos(false);
    }
  };

  const loadPairs = async (albumId: string) => {
    try {
      const response = await fetch(`/api/v1/gallery/albums/${albumId}/pairs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Помилка завантаження пар");
      }

      const pairsData = await response.json();
      setPairs(pairsData);
    } catch (error) {
      toast.error("Помилка завантаження пар");
    }
  };

  const handleUploadPhoto = async (
    file: File,
    index: number,
    type: "before" | "after"
  ) => {
    if (!selectedAlbum) return;

    try {
      console.log(`🔄 Завантаження фото '${type}' #${index + 1}`);
      setUploading((prev) => {
        const newState = [...prev];
        newState[type === "before" ? index : index + 3] = true;
        return newState;
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("albumId", selectedAlbum.id.toString());
      formData.append(
        "title",
        `${type === "before" ? "До" : "Після"} ${index + 1}`
      );
      formData.append(
        "description",
        `Фото ${type === "before" ? "до" : "після"} реконструкції ${index + 1}`
      );
      formData.append("tag", type);

      const uploadResponse = await fetch("/api/v1/upload/photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Помилка завантаження");
      }

      const photoData = await uploadResponse.json();
      console.log("✅ Фото завантажено:", photoData);

      // Додаємо фото до відповідного масиву
      if (type === "before") {
        setBeforePhotos((prev) => [...prev, photoData]);
      } else {
        setAfterPhotos((prev) => [...prev, photoData]);
      }

      toast.success(
        `Фото '${type === "before" ? "До" : "Після"}' #${index + 1} завантажено`
      );
    } catch (error) {
      console.error("❌ Помилка завантаження фото:", error);
      toast.error("Помилка завантаження фото");
    } finally {
      setUploading((prev) => {
        const newState = [...prev];
        newState[type === "before" ? index : index + 3] = false;
        return newState;
      });
    }
  };

  const handleCreatePair = async () => {
    if (beforePhotos.length !== 3 || afterPhotos.length !== 3) {
      toast.error("Потрібно завантажити рівно 3 фото 'До' і 3 фото 'Після'");
      return;
    }

    try {
      const beforePhotoIds = beforePhotos.map((photo) => photo.id);
      const afterPhotoIds = afterPhotos.map((photo) => photo.id);

      const response = await fetch("/api/v1/gallery/pairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          albumId: selectedAlbum?.id,
          beforePhotos: beforePhotoIds,
          afterPhotos: afterPhotoIds,
          label: "Нова реконструкція",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Помилка створення пари");
      }

      const pairData = await response.json();
      console.log("✅ Пара створена:", pairData);

      toast.success("Пара успішно створена!");

      // Очищаємо фото після створення пари
      setBeforePhotos([]);
      setAfterPhotos([]);

      // Перезавантажуємо дані
      if (selectedAlbum) {
        loadPhotos(selectedAlbum.id.toString());
        loadPairs(selectedAlbum.id.toString());
      }
    } catch (error) {
      console.error("❌ Помилка створення пари:", error);
      toast.error("Помилка створення пари");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ заборонено
          </h2>
          <p className="text-gray-600 mb-4">
            Будь ласка, увійдіть в систему для доступу до цієї сторінки.
          </p>
          <Button onClick={() => router.push("/login")}>
            Увійти в систему
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Галерея "До/Після"
        </h1>
        <p className="text-gray-600">
          Управління порівняльними фотографіями реконструкцій
        </p>
      </div>

      {/* Кнопки управління */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button onClick={() => setShowAddAlbum(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Створити пару з 6 фото
        </Button>
      </div>

      {/* Модальне вікно створення пари з 6 фото */}
      {showAddAlbum && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Створити пару "До/Після" з 6 фото
              </h3>

              <div className="space-y-8">
                {/* 3 фото "ДО" */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-4">ДО</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadPhoto(file, index, "before");
                            }
                          }}
                          disabled={uploading[index]}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        {beforePhotos[index] && (
                          <div className="text-xs text-green-600">
                            ✅ {beforePhotos[index].title}
                          </div>
                        )}
                        {uploading[index] && (
                          <div className="text-xs text-blue-600">
                            ⏳ Завантаження...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 фото "ПІСЛЯ" */}
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-4">
                    ПІСЛЯ
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadPhoto(file, index, "after");
                            }
                          }}
                          disabled={uploading[index + 3]}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        {afterPhotos[index] && (
                          <div className="text-xs text-green-600">
                            ✅ {afterPhotos[index].title}
                          </div>
                        )}
                        {uploading[index + 3] && (
                          <div className="text-xs text-blue-600">
                            ⏳ Завантаження...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Статус завантаження */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Статус завантаження:
                  </h4>
                  <div className="text-sm text-blue-700">
                    <div>Фото "До": {beforePhotos.length}/3</div>
                    <div>Фото "Після": {afterPhotos.length}/3</div>
                    <div className="font-medium mt-2">
                      {beforePhotos.length === 3 && afterPhotos.length === 3
                        ? "✅ Всі фото завантажено! Можна створити пару."
                        : "⚠️ Завантажте всі 6 фото"}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddAlbum(false);
                      setBeforePhotos([]);
                      setAfterPhotos([]);
                    }}
                  >
                    Скасувати
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreatePair}
                    disabled={
                      beforePhotos.length !== 3 || afterPhotos.length !== 3
                    }
                  >
                    Створити пару
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Відображення фото */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Завантажені фото
        </h2>
        {loadingPhotos ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : photos.length > 0 ? (
          <GroupedPhotos
            photos={photos}
            onDeletePhoto={() => {}}
            showTag={true}
            groupBy={groupBy}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Немає завантажених фото</p>
          </div>
        )}
      </div>
    </div>
  );
}

