"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { galleryApi, Album, BeforeAfterPair } from "@/lib/api";
import { Photo } from "../../../../shared-types";
import { useApi } from "@/hooks/useApi";
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
  const api = useApi();
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

  // Форми
  const [albumForm, setAlbumForm] = useState({ name: "", slug: "" });
  const [photoForm, setPhotoForm] = useState({ title: "", description: "" });
  const [pairForm, setPairForm] = useState({
    beforePhotoId: "",
    afterPhotoId: "",
    label: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    // Тимчасово відключено для тестування
    // if (!loading && !isAuthenticated) {
    //   router.push("/login");
    // }
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
        (album) => album.type === "BEFORE_AFTER"
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

  // Завантажити тільки фото "До"
  const loadBeforePhotos = async (albumId: string) => {
    try {
      const response = await fetch(
        `/api/v1/gallery/albums/${albumId}/photos?tag=before`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Помилка завантаження фото 'До'");
      }

      const photosData = await response.json();
      return photosData;
    } catch (error) {
      console.error("Помилка завантаження фото 'До':", error);
      return [];
    }
  };

  // Завантажити тільки фото "Після"
  const loadAfterPhotos = async (albumId: string) => {
    try {
      const response = await fetch(
        `/api/v1/gallery/albums/${albumId}/photos?tag=after`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Помилка завантаження фото 'Після'");
      }

      const photosData = await response.json();
      return photosData;
    } catch (error) {
      console.error("Помилка завантаження фото 'Після':", error);
      return [];
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

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await galleryApi.createAlbum({
        ...albumForm,
        type: "BEFORE_AFTER",
      });
      toast.success("Альбом створено");
      setShowAddAlbum(false);
      setAlbumForm({ name: "", slug: "" });
      loadAlbums();
    } catch (error) {
      toast.error("Помилка створення альбому");
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити це фото?")) return;

    try {
      await galleryApi.deletePhoto(photoId);
      toast.success("Фото видалено");
      if (selectedAlbum) {
        loadPhotos(selectedAlbum.id.toString());
        loadPairs(selectedAlbum.id.toString());
      }
    } catch (error) {
      toast.error("Помилка видалення фото");
    }
  };

  const handleDeletePair = async (pairId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю пару?")) return;

    try {
      await galleryApi.deletePair(pairId);
      toast.success("Пару видалено");
      if (selectedAlbum) {
        loadPairs(selectedAlbum.id.toString());
      }
    } catch (error) {
      toast.error("Помилка видалення пари");
    }
  };

  const getPhotoById = (photoId: string) => {
    if (!photoId) {
      console.log("🔍 getPhotoById: photoId is empty");
      return null;
    }

    const photo = photos.find((photo) => photo.id.toString() === photoId);
    console.log("🔍 getPhotoById:", {
      photoId,
      photo,
      photosCount: photos.length,
    });

    // Перевіряємо чи фото має всі необхідні властивості
    if (photo && (!photo.id || !photo.url)) {
      console.warn("⚠️ getPhotoById: photo missing required properties", photo);
      return null;
    }

    return photo;
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

  const handleRemoveBeforePhoto = (index: number) => {
    const newUrls = [...beforePhotoUrls];
    newUrls[index] = "";
    setBeforePhotoUrls(newUrls);

    const newFiles = [...beforeFiles];
    newFiles[index] = null as any;
    setBeforeFiles(newFiles);
  };

  const handleRemoveAfterPhoto = (index: number) => {
    const newUrls = [...afterPhotoUrls];
    newUrls[index] = "";
    setAfterPhotoUrls(newUrls);

    const newFiles = [...afterFiles];
    newFiles[index] = null as any;
    setAfterFiles(newFiles);
  };

  console.log("Render state:", {
    loading,
    isAuthenticated,
    albums,
    selectedAlbum,
    photos,
    pairs,
  });

  // Додаткові логи для діагностики
  console.log("🔍 Діагностика стану:");
  console.log("🔐 Авторизований:", isAuthenticated);
  console.log("👤 Користувач:", user ? user.email : "не завантажено");
  console.log("🔑 Токен:", token ? "є" : "немає");
  console.log("📂 Альбоми:", albums.length);
  console.log("🖼️ Фото:", photos.length);
  console.log("👥 Пари:", pairs.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Тимчасово відключено для тестування
  // if (!isAuthenticated) {
  //   return null;
  // }

  if (loadingAlbums) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження альбомів...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">До/Після галерея</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управління галереєю до/після з парним відображенням
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowAddAlbum(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Створити пару з 6 фото
          </Button>
          {selectedAlbum && (
            <>
              <Button onClick={() => setShowAddPhoto(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Завантажити фото
              </Button>
              <Button onClick={() => setShowAddPair(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Створити пару
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Кнопки групування */}
      {selectedAlbum && photos.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="flex space-x-2">
                <Button
                  variant={groupBy === "tag" ? "primary" : "secondary"}
                  onClick={() => setGroupBy("tag")}
                  size="sm"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  За мітками
                </Button>
                <Button
                  variant={groupBy === "pair" ? "primary" : "secondary"}
                  onClick={() => setGroupBy("pair")}
                  size="sm"
                >
                  <List className="h-4 w-4 mr-2" />
                  За парами
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">{photos.length} фото</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Альбоми */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Альбоми
              </h3>
              {loadingAlbums ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : albums.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Немає альбомів
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Створіть перший альбом для початку роботи
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {albums.map((album) => (
                    <button
                      key={album.id}
                      onClick={() => setSelectedAlbum(album)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedAlbum?.id === album.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {album.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Пари до/після */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedAlbum
                  ? `Пари в альбомі "${selectedAlbum.name}"`
                  : "Оберіть альбом"}
              </h3>

              {loadingPhotos ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-4 animate-pulse">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : pairs.length > 0 ? (
                <div className="space-y-6">
                  {pairs.map((pair) => {
                    const beforePhoto = getPhotoById(pair.beforePhotoId);
                    const afterPhoto = getPhotoById(pair.afterPhotoId);

                    console.log("🖼️ Відображення пари:", {
                      pairId: pair.id,
                      beforePhotoId: pair.beforePhotoId,
                      afterPhotoId: pair.afterPhotoId,
                      beforePhoto:
                        beforePhoto && beforePhoto.id && beforePhoto.url
                          ? { id: beforePhoto.id, url: beforePhoto.url }
                          : null,
                      afterPhoto:
                        afterPhoto && afterPhoto.id && afterPhoto.url
                          ? { id: afterPhoto.id, url: afterPhoto.url }
                          : null,
                    });

                    return (
                      <div
                        key={pair.id}
                        className="flex items-center space-x-4"
                      >
                        {/* До */}
                        <div className="relative group">
                          <img
                            src={
                              beforePhoto?.url ||
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEg4MFY4MEg0OFY0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSI0OCIgeT0iNDgiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTE2IDhIMjRWMjRIMTZWOE0xNiAxMkgyMFYyMEgxNlYxMloiIGZpbGw9IiM2MzY2RjEiLz4KPC9zdmc+Cjwvc3ZnPgo="
                            }
                            alt="До"
                            className="w-32 h-32 object-cover rounded-lg"
                            onError={(e) => {
                              console.error(
                                "❌ Помилка завантаження зображення 'До':",
                                beforePhoto?.url
                              );
                              e.currentTarget.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEg4MFY4MEg0OFY0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSI0OCIgeT0iNDgiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTE2IDhIMjRWMjRIMTZWOE0xNiAxMkgyMFYyMEgxNlYxMloiIGZpbGw9IiM2MzY2RjEiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                            }}
                          />
                          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <button
                              onClick={() =>
                                handleDeletePhoto(
                                  beforePhoto?.id?.toString() || ""
                                )
                              }
                              className="opacity-0 group-hover:opacity-100 text-white p-2 bg-red-600 rounded-full hover:bg-red-700 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            До
                          </div>
                        </div>

                        {/* Стрілка */}
                        <div className="flex flex-col items-center">
                          <ArrowRight className="h-6 w-6 text-gray-400" />
                          {pair.label && (
                            <span className="text-sm text-gray-600 mt-1">
                              {pair.label}
                            </span>
                          )}
                        </div>

                        {/* Після */}
                        <div className="relative group">
                          <img
                            src={
                              afterPhoto?.url ||
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEg4MFY4MEg0OFY0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSI0OCIgeT0iNDgiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTE2IDhIMjRWMjRIMTZWOE0xNiAxMkgyMFYyMEgxNlYxMloiIGZpbGw9IiM2MzY2RjEiLz4KPC9zdmc+Cjwvc3ZnPgo="
                            }
                            alt="Після"
                            className="w-32 h-32 object-cover rounded-lg"
                            onError={(e) => {
                              console.error(
                                "❌ Помилка завантаження зображення 'Після':",
                                afterPhoto?.url
                              );
                              e.currentTarget.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEg4MFY4MEg0OFY0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSI0OCIgeT0iNDgiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTE2IDhIMjRWMjRIMTZWOE0xNiAxMkgyMFYyMEgxNlYxMloiIGZpbGw9IiM2MzY2RjEiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                            }}
                          />
                          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <button
                              onClick={() =>
                                handleDeletePhoto(
                                  afterPhoto?.id?.toString() || ""
                                )
                              }
                              className="opacity-0 group-hover:opacity-100 text-white p-2 bg-red-600 rounded-full hover:bg-red-700 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            Після
                          </div>
                        </div>

                        {/* Кнопка видалення пари */}
                        <button
                          onClick={() => handleDeletePair(pair.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Немає пар
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Створіть першу пару до/після
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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

      {/* Модальне вікно завантаження фото */}
      {showAddPhoto && selectedAlbum && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Завантажити фото
              </h3>
              <form onSubmit={handleUploadPhoto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Файл
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <Input
                  label="Назва (опціонально)"
                  value={photoForm.title}
                  onChange={(e) =>
                    setPhotoForm({ ...photoForm, title: e.target.value })
                  }
                />
                <Input
                  label="Опис (опціонально)"
                  value={photoForm.description}
                  onChange={(e) =>
                    setPhotoForm({ ...photoForm, description: e.target.value })
                  }
                />
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddPhoto(false)}
                  >
                    Скасувати
                  </Button>
                  <Button type="submit" loading={uploading}>
                    Завантажити
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно створення пари */}
      {showAddPair && selectedAlbum && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Створити пару (3 фото "До" + 3 фото "Після")
              </h3>
              <form onSubmit={handleCreatePair} className="space-y-6">
                {/* Фото "До" */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Фото "До" (обов'язково 3 фото)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-4"
                      >
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          Фото "До" #{index + 1}
                        </div>

                        {beforePhotoUrls[index] ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={beforePhotoUrls[index]}
                                alt={`Фото до ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                  Завантажено
                                </p>
                                <p className="text-xs text-blue-600">Готово</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveBeforePhoto(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const newFiles = [...beforeFiles];
                                  newFiles[index] = file;
                                  setBeforeFiles(newFiles);
                                  handleUploadBeforePhoto(file, index);
                                }
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              disabled={uploadingBefore}
                            />
                            {uploadingBefore && (
                              <p className="text-sm text-blue-600 mt-1">
                                Завантаження...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Фото "Після" */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Фото "Після" (обов'язково 3 фото)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-4"
                      >
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          Фото "Після" #{index + 1}
                        </div>

                        {afterPhotoUrls[index] ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={afterPhotoUrls[index]}
                                alt={`Фото після ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">
                                  Завантажено
                                </p>
                                <p className="text-xs text-green-600">Готово</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveAfterPhoto(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const newFiles = [...afterFiles];
                                  newFiles[index] = file;
                                  setAfterFiles(newFiles);
                                  handleUploadAfterPhoto(file, index);
                                }
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                              disabled={uploadingAfter}
                            />
                            {uploadingAfter && (
                              <p className="text-sm text-green-600 mt-1">
                                Завантаження...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Input
                  label="Підпис (опціонально)"
                  value={pairForm.label}
                  onChange={(e) =>
                    setPairForm({ ...pairForm, label: e.target.value })
                  }
                />

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddPair(false);
                      setBeforeFiles([]);
                      setAfterFiles([]);
                      setBeforePhotoUrls([]);
                      setAfterPhotoUrls([]);
                      setPairForm({
                        beforePhotoId: "",
                        afterPhotoId: "",
                        label: "",
                      });
                    }}
                  >
                    Скасувати
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      beforePhotoUrls.filter((url) => url).length !== 3 ||
                      afterPhotoUrls.filter((url) => url).length !== 3 ||
                      uploadingBefore ||
                      uploadingAfter
                    }
                  >
                    Створити пару
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
