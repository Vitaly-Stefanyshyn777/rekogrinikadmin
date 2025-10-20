"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  uploaded: boolean;
  uploadedPhoto?: any;
}

interface Photo {
  id: number;
  albumId: number;
  url: string;
  title: string;
  description: string;
  tag: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

export default function GalleryPage() {
  const { user, isLoading } = useAuth();
  const [photo, setPhoto] = useState<UploadState>({
    file: null,
    preview: null,
    uploading: false,
    uploaded: false,
  });

  const [albumId, setAlbumId] = useState("1"); // ID звичайного альбому
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Завантаження всіх фото
  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const token = localStorage.getItem("authToken");

      // Використовуємо публічний ендпоїнт старого сервера для отримання фото звичайної галереї
      const response = await fetch(
        `http://localhost:3002/api/v1/public/gallery/albums/general`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Помилка завантаження даних");
      }

      const data = await response.json();

      // Обробляємо дані зі старого сервера
      // Створюємо масив всіх фото
      const allPhotos: Photo[] = [];

      // Додаємо всі фото з альбому
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach((photo: any) => {
          allPhotos.push({
            id: photo.id,
            albumId: photo.albumId,
            url: photo.url,
            title: photo.title,
            description: photo.description,
            tag: photo.tag,
            fileName: photo.title,
            fileSize: 0,
            mimeType: "image/jpeg",
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt,
          });
        });
      }

      setUploadedPhotos(allPhotos);
    } catch (err) {
      console.error("Помилка завантаження фото:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Видалення фото
  const deletePhoto = async (photoId: number) => {
    if (!confirm("Ви впевнені, що хочете видалити це фото?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `http://localhost:3002/api/v1/photos?id=${photoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Помилка видалення фото");
      }

      // Оновлюємо список після видалення
      await fetchPhotos();
      alert("Фото успішно видалено!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Помилка видалення");
    }
  };

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user, albumId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    // Встановлюємо файл і прев'ю
    setPhoto({ file, preview, uploading: false, uploaded: false });
  };

  const handleUpload = async () => {
    if (!photo.file) {
      alert("Спочатку виберіть файл!");
      return;
    }

    // Позначаємо як завантажується
    setPhoto((prev) => ({ ...prev, uploading: true }));

    const result = await uploadPhoto(photo.file);

    if (result) {
      // Показуємо успішне завантаження, але дозволяємо завантажити наступне
      setPhoto({
        file: null,
        preview: null,
        uploading: false,
        uploaded: false, // Скидаємо, щоб можна було завантажити наступне
      });
      // Оновлюємо список фото після завантаження
      await fetchPhotos();
      alert("Фото успішно завантажено! Можете завантажити наступне.");
    } else {
      // Скидаємо стан завантаження при помилці
      setPhoto((prev) => ({ ...prev, uploading: false }));
      alert("Помилка завантаження фото!");
    }
  };

  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("albumId", albumId);
    formData.append("title", file.name);
    formData.append("description", "");
    formData.append("tag", "general");

    // Отримуємо токен з localStorage
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        "http://localhost:3002/api/v1/upload/photo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Фото завантажено:", result);
        return result;
      } else {
        console.error("Помилка завантаження:", response.statusText);
        return null;
      }
    } catch (error) {
      console.error("Помилка:", error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Завантаження фото в галерею
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID альбому:
          </label>
          <input
            type="text"
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-32"
            placeholder="1"
          />
        </div>

        {/* Одна картка для завантаження */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Завантаження фото
            {photo.uploading && (
              <span className="ml-2 text-blue-600">(Завантаження...)</span>
            )}
          </h2>

          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              disabled={photo.uploading}
            />
          </div>

          {photo.preview && (
            <div className="mb-4">
              <img
                src={photo.preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!photo.file || photo.uploading}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              photo.file && !photo.uploading
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {photo.uploading ? "Завантаження..." : "Завантажити"}
          </button>
        </div>

        {/* Відображення завантажених фото */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Завантажені фото
            {loadingPhotos && (
              <span className="ml-2 text-blue-600">(Завантаження...)</span>
            )}
          </h2>

          {loadingPhotos ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Завантаження фото...</p>
            </div>
          ) : uploadedPhotos.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Немає завантажених фото
              </h3>
              <p className="text-gray-600">
                Завантажте перше фото, щоб побачити його тут
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  {/* Прев'ю фото */}
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  {/* Інформація про фото */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {photo.tag}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(photo.createdAt).toLocaleDateString("uk-UA")}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-1">
                      {photo.title || photo.fileName}
                    </h3>

                    {photo.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {photo.description}
                      </p>
                    )}

                    <div className="text-xs text-gray-500 mb-3">
                      <p>Файл: {photo.fileName}</p>
                      <p>
                        Розмір: {(photo.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {/* Кнопка видалення */}
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="w-full bg-red-600 text-white text-sm py-1 px-3 rounded hover:bg-red-700"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Інструкції:
          </h3>
          <ul className="text-green-800 space-y-1">
            <li>• Виберіть файл для завантаження</li>
            <li>• Натисніть "Завантажити" для завантаження фото</li>
            <li>• Фото буде збережено в звичайну галерею</li>
            <li>• Автоматична мітка "general" для фото</li>
            <li>• Можна завантажити скільки завгодно фото по одному</li>
            <li>• Після завантаження можна вибрати наступне фото</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
