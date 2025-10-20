"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { galleryApi, Album, Photo } from "@/lib/api";
import { Plus, Upload, Trash2, Edit, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function GalleryPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Форми
  const [albumForm, setAlbumForm] = useState({ name: "", slug: "" });
  const [photoForm, setPhotoForm] = useState({ title: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Тимчасово відключено для тестування
    // if (!loading && !isAuthenticated) {
    //   router.push("/login");
    // }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Завантажуємо альбоми тільки якщо є валідний токен
    if (token && token !== "undefined" && token !== "null") {
      loadAlbums();
    }
  }, [token]);

  useEffect(() => {
    if (selectedAlbum) {
      loadPhotos(selectedAlbum.id);
    }
  }, [selectedAlbum]);

  const loadAlbums = async () => {
    try {
      setLoadingAlbums(true);
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
      const generalAlbums = albumsData.filter(
        (album) => album.type === "GENERAL"
      );
      setAlbums(generalAlbums);
      if (generalAlbums.length > 0 && !selectedAlbum) {
        setSelectedAlbum(generalAlbums[0]);
      }
    } catch (error) {
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

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await galleryApi.createAlbum({
        ...albumForm,
        type: "GENERAL",
      });
      toast.success("Альбом створено");
      setShowAddAlbum(false);
      setAlbumForm({ name: "", slug: "" });
      loadAlbums();
    } catch (error) {
      toast.error("Помилка створення альбому");
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedAlbum) return;

    try {
      setUploading(true);

      // Завантажуємо файл
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadResponse = await fetch("/api/v1/upload/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Помилка завантаження");
      }

      const uploadData = await uploadResponse.json();

      // Зберігаємо в базу
      await galleryApi.createPhoto({
        albumId: selectedAlbum.id,
        url: uploadData.url,
        publicId: uploadData.publicId,
        title: photoForm.title,
        description: photoForm.description,
      });

      toast.success("Фото завантажено");
      setShowAddPhoto(false);
      setPhotoForm({ title: "", description: "" });
      setSelectedFile(null);
      loadPhotos(selectedAlbum.id);
    } catch (error) {
      toast.error("Помилка завантаження фото");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (
      !confirm(
        "Ви впевнені, що хочете видалити це фото? Цю дію неможливо скасувати."
      )
    )
      return;

    try {
      console.log("🗑️ Видалення фото:", photoId);
      await galleryApi.deletePhoto(photoId);
      toast.success("Фото успішно видалено");
      if (selectedAlbum) {
        loadPhotos(selectedAlbum.id);
      }
    } catch (error) {
      console.error("❌ Помилка видалення фото:", error);
      toast.error("Помилка видалення фото");
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Галерея</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управління звичайною галереєю
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowAddAlbum(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Додати альбом
          </Button>
          {selectedAlbum && (
            <Button onClick={() => setShowAddPhoto(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Завантажити фото
            </Button>
          )}
        </div>
      </div>

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

        {/* Фото */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedAlbum
                  ? `Фото в альбомі "${selectedAlbum.name}"`
                  : "Оберіть альбом"}
              </h3>

              {loadingPhotos ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.title || "Фото"}
                        className="aspect-square object-cover rounded-lg"
                      />
                      {/* Кнопка видалення - завжди видима */}
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 text-white p-2 bg-red-600 rounded-full hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg"
                        title="Видалити фото"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {photo.title && (
                        <p className="mt-2 text-sm text-gray-600 truncate">
                          {photo.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Немає фото
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Завантажте перше фото в цей альбом
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальне вікно додавання альбому */}
      {showAddAlbum && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Додати альбом
              </h3>
              <form onSubmit={handleCreateAlbum} className="space-y-4">
                <Input
                  label="Назва альбому"
                  value={albumForm.name}
                  onChange={(e) =>
                    setAlbumForm({ ...albumForm, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Slug (URL)"
                  value={albumForm.slug}
                  onChange={(e) =>
                    setAlbumForm({ ...albumForm, slug: e.target.value })
                  }
                  required
                />
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddAlbum(false)}
                  >
                    Скасувати
                  </Button>
                  <Button type="submit">Створити</Button>
                </div>
              </form>
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
    </div>
  );
}
