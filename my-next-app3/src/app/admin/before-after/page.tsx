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

export default function BeforeAfterPage() {
  const { user, isLoading } = useAuth();
  const [beforePhotos, setBeforePhotos] = useState<UploadState[]>([
    { file: null, preview: null, uploading: false, uploaded: false },
    { file: null, preview: null, uploading: false, uploaded: false },
    { file: null, preview: null, uploading: false, uploaded: false },
  ]);

  const [afterPhotos, setAfterPhotos] = useState<UploadState[]>([
    { file: null, preview: null, uploading: false, uploaded: false },
    { file: null, preview: null, uploading: false, uploaded: false },
    { file: null, preview: null, uploading: false, uploaded: false },
  ]);

  const [albumId, setAlbumId] = useState("2"); // ID альбому "До і Після"
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Завантаження всіх фото
  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const token = localStorage.getItem("authToken");

      // Використовуємо публічний ендпоїнт старого сервера для отримання фото альбому "До і Після"
      const response = await fetch(
        `http://localhost:3002/api/v1/public/gallery/albums/before-after`,
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
            tag: photo.tag || "before", // Якщо tag null, встановлюємо "before"
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: "before" | "after"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    if (type === "before") {
      setBeforePhotos((prev) =>
        prev.map((photo, i) =>
          i === index
            ? { file, preview, uploading: false, uploaded: false }
            : photo
        )
      );
    } else {
      setAfterPhotos((prev) =>
        prev.map((photo, i) =>
          i === index
            ? { file, preview, uploading: false, uploaded: false }
            : photo
        )
      );
    }
  };

  const uploadPhoto = async (
    file: File,
    tag: "before" | "after",
    index: number
  ) => {
    try {
      const authToken = localStorage.getItem("authToken");
      console.log("Токен з localStorage:", authToken);

      if (!authToken) {
        alert("Потрібна авторизація!");
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("albumId", albumId);
      formData.append("tag", tag);

      console.log("Відправляємо запит з токеном:", `Bearer ${authToken}`);

      const response = await fetch(
        "http://localhost:3002/api/v1/upload/photo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      console.log("Відповідь сервера:", response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log("Фото завантажено:", result);
        return result;
      } else {
        const errorText = await response.text();
        console.error("Помилка завантаження:", response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error("Помилка:", error);
      return null;
    }
  };

  const handleUpload = async (type: "before" | "after", index: number) => {
    console.log("🔄 Початок завантаження:", { type, index });
    const photos = type === "before" ? beforePhotos : afterPhotos;
    const photo = photos[index];

    if (!photo.file) {
      alert("Спочатку виберіть файл!");
      return;
    }

    console.log("📁 Файл для завантаження:", photo.file.name);

    // Позначаємо як завантажується
    if (type === "before") {
      setBeforePhotos((prev) =>
        prev.map((p, i) => (i === index ? { ...p, uploading: true } : p))
      );
    } else {
      setAfterPhotos((prev) =>
        prev.map((p, i) => (i === index ? { ...p, uploading: true } : p))
      );
    }

    const result = await uploadPhoto(photo.file, type, index);
    console.log("📤 Результат завантаження:", result);

    if (result) {
      console.log("✅ Фото успішно завантажено!");
      // Зберігаємо інформацію про завантажене фото
      if (type === "before") {
        setBeforePhotos((prev) =>
          prev.map((p, i) =>
            i === index
              ? {
                  file: null,
                  preview: null,
                  uploading: false,
                  uploaded: true,
                  uploadedPhoto: result,
                }
              : p
          )
        );
      } else {
        setAfterPhotos((prev) =>
          prev.map((p, i) =>
            i === index
              ? {
                  file: null,
                  preview: null,
                  uploading: false,
                  uploaded: true,
                  uploadedPhoto: result,
                }
              : p
          )
        );
      }
      // Оновлюємо список фото після завантаження
      await fetchPhotos();
      alert("Фото успішно завантажено!");
    } else {
      console.log("❌ Помилка завантаження фото!");
      // Скидаємо стан завантаження при помилці
      if (type === "before") {
        setBeforePhotos((prev) =>
          prev.map((p, i) => (i === index ? { ...p, uploading: false } : p))
        );
      } else {
        setAfterPhotos((prev) =>
          prev.map((p, i) => (i === index ? { ...p, uploading: false } : p))
        );
      }
      alert("Помилка завантаження фото!");
    }
  };

  const uploadAllPhotos = async () => {
    const allBeforeFiles = beforePhotos.filter((photo) => photo.file);
    const allAfterFiles = afterPhotos.filter((photo) => photo.file);

    if (allBeforeFiles.length === 0 && allAfterFiles.length === 0) {
      alert("Спочатку виберіть файли для завантаження!");
      return;
    }

    // Завантажуємо всі фото "До"
    for (let i = 0; i < allBeforeFiles.length; i++) {
      const photo = allBeforeFiles[i];
      if (photo.file) {
        const result = await uploadPhoto(photo.file, "before", i);
        if (result) {
          setBeforePhotos((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                    file: null,
                    preview: null,
                    uploading: false,
                    uploaded: true,
                    uploadedPhoto: result,
                  }
                : p
            )
          );
        }
      }
    }

    // Завантажуємо всі фото "Після"
    for (let i = 0; i < allAfterFiles.length; i++) {
      const photo = allAfterFiles[i];
      if (photo.file) {
        const result = await uploadPhoto(photo.file, "after", i);
        if (result) {
          setAfterPhotos((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                    file: null,
                    preview: null,
                    uploading: false,
                    uploaded: true,
                    uploadedPhoto: result,
                  }
                : p
            )
          );
        }
      }
    }

    alert("Всі фото успішно завантажені!");
  };

  const renderPhotoSlot = (
    photo: UploadState,
    index: number,
    type: "before" | "after"
  ) => (
    <div key={index} className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">
        {type === "before" ? "До" : "Після"} {index + 1}
        {photo.uploading && (
          <span className="ml-2 text-blue-600">(Завантаження...)</span>
        )}
        {photo.uploaded && (
          <span className="ml-2 text-green-600">✓ Завантажено</span>
        )}
      </h3>

      {photo.uploaded && photo.uploadedPhoto ? (
        <div className="mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800 font-medium">
                Фото завантажено
              </span>
            </div>
            <p className="text-sm text-green-700">
              Файл: {photo.uploadedPhoto.fileName}
            </p>
            <p className="text-sm text-green-700">
              Розмір: {(photo.uploadedPhoto.fileSize / 1024 / 1024).toFixed(2)}{" "}
              MB
            </p>
            <p className="text-sm text-green-700">
              Тег: {photo.uploadedPhoto.tag}
            </p>
            <button
              onClick={() => {
                if (type === "before") {
                  setBeforePhotos((prev) =>
                    prev.map((p, i) =>
                      i === index
                        ? {
                            file: null,
                            preview: null,
                            uploading: false,
                            uploaded: false,
                          }
                        : p
                    )
                  );
                } else {
                  setAfterPhotos((prev) =>
                    prev.map((p, i) =>
                      i === index
                        ? {
                            file: null,
                            preview: null,
                            uploading: false,
                            uploaded: false,
                          }
                        : p
                    )
                  );
                }
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Завантажити інше фото
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, index, type)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
            onClick={() => handleUpload(type, index)}
            disabled={!photo.file || photo.uploading}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              photo.file && !photo.uploading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {photo.uploading ? "Завантаження..." : "Завантажити"}
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Завантаження фото "До і Після"
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
            placeholder="2"
          />
        </div>

        {/* Кнопка завантаження всіх фото */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Завантаження фото "До і Після"
              </h2>
              <p className="text-gray-600 mt-1">
                Виберіть файли та завантажте їх на сервер
              </p>
            </div>
            <button
              onClick={uploadAllPhotos}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Завантажити всі фото
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Фото "До" */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Фото "До" (3 обов'язкові)
            </h2>
            <div className="space-y-6">
              {beforePhotos.map((photo, index) =>
                renderPhotoSlot(photo, index, "before")
              )}
            </div>
          </div>

          {/* Фото "Після" */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Фото "Після" (3 обов'язкові)
            </h2>
            <div className="space-y-6">
              {afterPhotos.map((photo, index) =>
                renderPhotoSlot(photo, index, "after")
              )}
            </div>
          </div>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                Завантажте перші фото, щоб побачити їх тут
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedPhotos.map((photo, index) => (
                <div
                  key={`${photo.id}-${index}`}
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
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          photo.tag === "before"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
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

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Інструкції:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Виберіть файл для кожного слота</li>
            <li>• Натисніть "Завантажити" для кожного фото</li>
            <li>• Обов'язково завантажте 3 фото "До" та 3 фото "Після"</li>
            <li>• Система автоматично створить пари після завантаження</li>
            <li>
              • Використовуйте кнопку "Завантажити всі фото" для пакетного
              завантаження
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
