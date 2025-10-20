"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  uploaded: boolean;
  uploadedPhoto?: Photo;
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

interface Collection {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Pair {
  id: number;
  beforePhoto: Photo;
  afterPhoto: Photo;
  collectionId: number;
  createdAt: string;
  updatedAt: string;
}

export default function BeforeAfterPage() {
  const { user } = useAuth();
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

  const [albumId] = useState("3"); // ID альбому "До і Після"
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);

  // Завантаження всіх фото
  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const token = localStorage.getItem("authToken");

      // Використовуємо публічний ендпоїнт старого сервера для отримання фото альбому "До і Після"
      const timestamp = Date.now();
      const url = `http://localhost:3002/api/v1/public/gallery/albums/before-after?t=${timestamp}`;
      console.log("🔍 Запитуємо дані з URL:", url);

      const response = await fetch(url, {
        // Забороняємо кеш, щоб одразу бачити актуальні зміни після видалення/заміни
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Помилка завантаження даних");
      }

      const data = await response.json();
      console.log("🔍 Дані з API після запиту:", {
        photos: data.photos?.length || 0,
        collections: data.collections?.length || 0,
        pairs: data.pairs?.length || 0,
        rawData: data,
      });

      // Обробляємо дані зі старого сервера
      // Створюємо масив всіх фото
      const allPhotos: Photo[] = [];

      // Додаємо всі фото з альбому
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach((photo: Photo) => {
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

      console.log(
        "📸 Встановлюємо завантажені фото:",
        allPhotos.length,
        "фото"
      );
      setUploadedPhotos(allPhotos);

      // Зберігаємо колекції
      console.log("🔍 Перевіряємо колекції з API:", {
        hasCollections: !!data.collections,
        collectionsLength: data.collections?.length || 0,
        collectionsType: typeof data.collections,
        rawCollections: data.collections,
      });

      if (data.collections && data.collections.length > 0) {
        setCollections(data.collections);
        console.log("📁 Колекції:", data.collections.length, data.collections);
      } else {
        setCollections([]);
        console.log("📁 Колекції: 0");
      }

      // Зберігаємо пари для подальшого рендерингу по колекціях
      if (data.pairs && Array.isArray(data.pairs)) {
        setPairs(data.pairs);
      } else {
        setPairs([]);
      }

      console.log("✅ Стан оновлено!");
    } catch (err) {
      console.error("Помилка завантаження фото:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Зміна фото
  const changePhoto = (photoId: number) => {
    // Знаходимо фото за ID
    const photo = uploadedPhotos.find((p) => p.id === photoId);
    if (!photo) {
      alert("Фото не знайдено!");
      return;
    }

    // Створюємо input для вибору нового файлу
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Перевіряємо розмір файлу (максимум 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Розмір файлу не повинен перевищувати 10MB!");
        return;
      }

      // Показуємо підтвердження
      if (!confirm(`Замінити фото "${photo.title}" на нове?`)) {
        return;
      }

      try {
        console.log("🔄 Замінюємо фото:", photo.title);

        const token = localStorage.getItem("authToken");

        // Знаходимо пару, до якої належить це фото
        const pairsResponse = await fetch(
          `http://localhost:3002/api/v1/public/gallery/albums/before-after`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!pairsResponse.ok) {
          throw new Error("Помилка отримання даних про пари");
        }

        const pairsData = await pairsResponse.json();
        const pair = pairsData.pairs.find(
          (p: Pair) =>
            p.beforePhoto.id === photoId || p.afterPhoto.id === photoId
        );

        if (!pair) {
          // Якщо пара не знайдена, створюємо нову пару
          console.log("Пара не знайдена, створюємо нову...");

          // Спочатку завантажуємо нове фото
          const formData = new FormData();
          formData.append("file", file);
          formData.append("albumId", albumId);
          formData.append("title", photo.title);
          formData.append("description", photo.description);
          formData.append("tag", photo.tag);

          const uploadResponse = await fetch(
            "http://localhost:3002/api/v1/upload/photo",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            throw new Error("Помилка завантаження нового фото");
          }

          const newPhoto = await uploadResponse.json();
          console.log("Нове фото завантажено:", newPhoto);

          // Оновлюємо список
          await fetchPhotos();
          alert("Фото успішно замінено!");
          return;
        }

        // Визначаємо, яке фото замінюємо (до або після)
        const isBeforePhoto = pair.beforePhotoId === photoId;
        const endpoint = isBeforePhoto
          ? `http://localhost:3002/api/v1/upload/pairs/${pair.id}/before`
          : `http://localhost:3002/api/v1/upload/pairs/${pair.id}/after`;

        // Замінюємо фото в парі
        const formData = new FormData();
        formData.append("file", file);

        const replaceResponse = await fetch(endpoint, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!replaceResponse.ok) {
          throw new Error("Помилка заміни фото в парі");
        }

        // Оновлюємо список
        await fetchPhotos();
        alert("Фото успішно замінено!");
      } catch (err) {
        console.error("Помилка заміни фото:", err);
        alert(err instanceof Error ? err.message : "Помилка заміни фото");
      }
    };

    input.click();
  };

  // Видалення конкретної колекції
  const deleteSpecificCollection = async (collectionId: number) => {
    if (
      !confirm(
        `Ви впевнені, що хочете видалити колекцію #${collectionId}? Цю дію неможливо скасувати!`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      // Optimistic update: одразу видаляємо колекцію з локального стану
      setCollections((prev) =>
        prev.filter((collection) => collection.id !== collectionId)
      );
      console.log(
        `🗑️ Optimistic update: видаляємо колекцію #${collectionId} зі стану`
      );

      const deleteResponse = await fetch(
        `http://localhost:3002/api/v1/gallery/albums/${albumId}/collections/${collectionId}?deletePhotos=true`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        // Якщо помилка, повертаємо колекцію назад
        await fetchPhotos();
        throw new Error(`Помилка видалення колекції #${collectionId}`);
      }

      const result = await deleteResponse.json();
      console.log(`Колекція #${collectionId} видалена:`, result);

      // Примусово оновлюємо список для синхронізації з сервером
      console.log("🔄 Оновлюємо дані після видалення колекції...");

      // Очищаємо локальний стан перед оновленням
      setUploadedPhotos([]);
      setCollections([]);

      await fetchPhotos();
      console.log("✅ Дані оновлено після видалення колекції");
      alert(`Колекція #${collectionId} успішно видалена!`);
    } catch (err) {
      console.error("Помилка видалення колекції:", err);
      alert(err instanceof Error ? err.message : "Помилка видалення колекції");
    }
  };

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user, albumId]);

  // Логування змін в uploadedPhotos
  useEffect(() => {
    console.log("📊 uploadedPhotos змінився:", uploadedPhotos.length, "фото");
  }, [uploadedPhotos]);

  // Логування змін в collections
  useEffect(() => {
    console.log(
      "📁 collections змінився:",
      collections.length,
      "колекцій",
      collections
    );
  }, [collections]);

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

  const uploadPhoto = async (file: File, tag: "before" | "after") => {
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

  const uploadAllPhotos = async () => {
    console.log("🚀 Початок завантаження всіх фото...");
    const allBeforeFiles = beforePhotos.filter((photo) => photo.file);
    const allAfterFiles = afterPhotos.filter((photo) => photo.file);

    console.log("📁 Файли для завантаження:", {
      before: allBeforeFiles.length,
      after: allAfterFiles.length,
    });

    if (allBeforeFiles.length === 0 && allAfterFiles.length === 0) {
      alert("Спочатку виберіть файли для завантаження!");
      return;
    }

    // Завантажуємо всі фото "До"
    console.log("📤 Завантажуємо фото 'До'...");
    for (let i = 0; i < allBeforeFiles.length; i++) {
      const photo = allBeforeFiles[i];
      if (photo.file) {
        console.log(
          `📤 Завантажуємо фото "До" ${i + 1}/${allBeforeFiles.length}`
        );
        const result = await uploadPhoto(photo.file, "before");
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
    console.log("📤 Завантажуємо фото 'Після'...");
    for (let i = 0; i < allAfterFiles.length; i++) {
      const photo = allAfterFiles[i];
      if (photo.file) {
        console.log(
          `📤 Завантажуємо фото "Після" ${i + 1}/${allAfterFiles.length}`
        );
        const result = await uploadPhoto(photo.file, "after");
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

    // Оновлюємо список фото після завантаження всіх фото
    console.log("🔄 Оновлюємо список після завантаження всіх фото...");
    await fetchPhotos();
    console.log("✅ Список фото оновлено після завантаження всіх фото!");
    // Готуємо слоти для наступної колекції: очищаємо локальні стани слотів
    setBeforePhotos([
      { file: null, preview: null, uploading: false, uploaded: false },
      { file: null, preview: null, uploading: false, uploaded: false },
      { file: null, preview: null, uploading: false, uploaded: false },
    ]);
    setAfterPhotos([
      { file: null, preview: null, uploading: false, uploaded: false },
      { file: null, preview: null, uploading: false, uploaded: false },
      { file: null, preview: null, uploading: false, uploaded: false },
    ]);
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
        {/* Прибрано індикатор "Завантажено" на вимогу */}
      </h3>

      {photo.uploaded && photo.uploadedPhoto ? (
        <div className="mb-4">
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
            className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded text-sm"
          >
            Завантажити інше фото
          </button>
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

          {/* Прибрано індивідуальну кнопку завантаження — залишаємо лише "Завантажити всі фото" */}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Завантаження фото &quot;До і Після&quot;
        </h1>

        {/* Прибрано поле "ID альбому" зі сторінки */}

        {/* Кнопка завантаження всіх фото */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Завантаження фото &quot;До і Після&quot;
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
              Фото &quot;До&quot; (3 обов&apos;язкові)
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
              Фото &quot;Після&quot; (3 обов&apos;язкові)
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Завантажені фото
              {loadingPhotos && (
                <span className="ml-2 text-blue-600">(Завантаження...)</span>
              )}
            </h2>
            {/* Прибрано глобальну кнопку видалення усіх колекцій */}
          </div>

          {/* Прибрано старий список колекцій (тепер рендеримо тільки нові блоки-колекції нижче) */}

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
            <div className="space-y-6">
              {collections.length > 0
                ? collections.map((collection) => {
                    const pairsInCollection = pairs.filter(
                      (p) => p.collectionId === collection.id
                    );

                    // Розкладаємо фото по рядах: верхній — before, нижній — after
                    const beforeRow = pairsInCollection
                      .map((p) =>
                        p.beforePhoto
                          ? { ...p.beforePhoto, tag: "before" }
                          : null
                      )
                      .filter(Boolean);
                    const afterRow = pairsInCollection
                      .map((p) =>
                        p.afterPhoto ? { ...p.afterPhoto, tag: "after" } : null
                      )
                      .filter(Boolean);

                    return (
                      <div
                        key={collection.id}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center justify-between p-4 border-b">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Колекція #{collection.id}
                          </h4>
                          <button
                            onClick={() =>
                              deleteSpecificCollection(collection.id)
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            🗑️ Видалити колекцію
                          </button>
                        </div>

                        <div className="p-4 space-y-6">
                          {/* Верхній ряд: До */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {beforeRow.map(
                              (photo) =>
                                photo && (
                                  <div
                                    key={`before-${photo.id}`}
                                    className="bg-white rounded-lg shadow overflow-hidden"
                                  >
                                    <div className="aspect-w-16 aspect-h-9">
                                      <img
                                        src={photo.url}
                                        alt={photo.title || "before"}
                                        className="w-full h-48 object-cover"
                                      />
                                    </div>
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                          before
                                        </span>
                                        {photo.createdAt && (
                                          <span className="text-xs text-gray-500">
                                            {new Date(
                                              photo.createdAt
                                            ).toLocaleDateString("uk-UA")}
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => changePhoto(photo.id)}
                                        className="w-full bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700"
                                      >
                                        Змінити фото
                                      </button>
                                    </div>
                                  </div>
                                )
                            )}
                          </div>

                          {/* Нижній ряд: Після */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {afterRow.map(
                              (photo) =>
                                photo && (
                                  <div
                                    key={`after-${photo.id}`}
                                    className="bg-white rounded-lg shadow overflow-hidden"
                                  >
                                    <div className="aspect-w-16 aspect-h-9">
                                      <img
                                        src={photo.url}
                                        alt={photo.title || "after"}
                                        className="w-full h-48 object-cover"
                                      />
                                    </div>
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                          after
                                        </span>
                                        {photo.createdAt && (
                                          <span className="text-xs text-gray-500">
                                            {new Date(
                                              photo.createdAt
                                            ).toLocaleDateString("uk-UA")}
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => changePhoto(photo.id)}
                                        className="w-full bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700"
                                      >
                                        Змінити фото
                                      </button>
                                    </div>
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                : uploadedPhotos.map((photo, index) => (
                    <div
                      key={`${photo.id}-${index}`}
                      className="bg-white rounded-lg shadow overflow-hidden"
                    >
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
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
                            {new Date(photo.createdAt).toLocaleDateString(
                              "uk-UA"
                            )}
                          </span>
                        </div>
                        <button
                          onClick={() => changePhoto(photo.id)}
                          className="w-full bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700"
                        >
                          Змінити фото
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
            {/* Прибрано інструкцію про індивідуальну кнопку завантаження */}
            <li>
              • Обов&apos;язково завантажте 3 фото &quot;До&quot; та 3 фото
              &quot;Після&quot;
            </li>
            <li>• Система автоматично створить пари після завантаження</li>
            <li>
              • Використовуйте кнопку &quot;Завантажити всі фото&quot; для
              пакетного завантаження
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
