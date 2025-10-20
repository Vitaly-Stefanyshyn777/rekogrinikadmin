"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  Trash2,
  RotateCcw,
  Tag,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api";

interface Album {
  id: string;
  name: string;
  slug: string;
  type: "GENERAL" | "BEFORE_AFTER";
  createdAt: string;
}

interface Photo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tag?: string;
  createdAt: string;
}

interface Pair {
  id: string;
  beforePhoto?: Photo;
  afterPhoto?: Photo;
  label?: string;
  createdAt: string;
}

export default function BeforeAfterPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [beforePhotos, setBeforePhotos] = useState<Photo[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<Photo[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<"before" | "after">("before");

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  // Validation states
  const [beforeError, setBeforeError] = useState("");
  const [afterError, setAfterError] = useState("");

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      loadPhotos();
      loadPairs();
    }
  }, [selectedAlbum]);

  // Validation functions
  const validatePhotos = () => {
    setBeforeError("");
    setAfterError("");
    
    if (beforePhotos.length < 3) {
      setBeforeError(`Потрібно додати ще ${3 - beforePhotos.length} фото "До"`);
    }
    if (afterPhotos.length < 3) {
      setAfterError(`Потрібно додати ще ${3 - afterPhotos.length} фото "Після"`);
    }
  };

  useEffect(() => {
    validatePhotos();
  }, [beforePhotos, afterPhotos]);

  const loadAlbums = async () => {
    try {
      const response = await apiClient.getAlbums();
      if (response.data) {
        const beforeAfterAlbums = response.data.filter(
          (album) => album.type === "BEFORE_AFTER"
        );
        setAlbums(beforeAfterAlbums);
        if (beforeAfterAlbums.length > 0) {
          setSelectedAlbum(beforeAfterAlbums[0]);
        }
      }
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPhotos = async () => {
    if (!selectedAlbum) return;

    try {
      const [beforeResponse, afterResponse] = await Promise.all([
        apiClient.getAlbumPhotos(selectedAlbum.id, "before"),
        apiClient.getAlbumPhotos(selectedAlbum.id, "after"),
      ]);

      if (beforeResponse.data) setBeforePhotos(beforeResponse.data);
      if (afterResponse.data) setAfterPhotos(afterResponse.data);
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  };

  const loadPairs = async () => {
    if (!selectedAlbum) return;

    try {
      const response = await apiClient.getAlbumPairs(selectedAlbum.id);
      if (response.data) {
        setPairs(response.data);
      }
    } catch (error) {
      console.error("Error loading pairs:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedAlbum) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("albumId", selectedAlbum.id);
      formData.append("title", title || `Фото ${selectedTag} ${Date.now()}`);
      formData.append("description", "");
      formData.append("tag", selectedTag);

      const response = await apiClient.uploadPhoto(formData);
      if (response.data) {
        setShowUploadModal(false);
        setFile(null);
        setTitle("");
        setPreview(null);
        loadPhotos();
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRecreatePairs = async () => {
    if (!selectedAlbum) return;

    try {
      await apiClient.recreatePairs(selectedAlbum.id);
      loadPairs();
    } catch (error) {
      console.error("Error recreating pairs:", error);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити це фото?")) return;

    try {
      await apiClient.deletePhoto(photoId);
      loadPhotos();
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  const handleDeletePair = async (pairId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю пару?")) return;

    try {
      await apiClient.deletePair(pairId);
      loadPairs();
    } catch (error) {
      console.error("Error deleting pair:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Галерея "До/Після"</h1>

      {/* Album selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Альбоми "До/Після"</h2>
        <div className="flex flex-wrap gap-2">
          {albums.map((album) => (
            <Button
              key={album.id}
              variant={selectedAlbum?.id === album.id ? "default" : "outline"}
              onClick={() => setSelectedAlbum(album)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedAlbum?.id === album.id
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {album.name}
            </Button>
          ))}
        </div>
      </div>

      {selectedAlbum && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <Tag className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Фото "До"</p>
                <p className="text-2xl font-bold text-gray-900">
                  {beforePhotos.length}/3
                </p>
                {beforeError && (
                  <p className="text-sm text-red-500">{beforeError}</p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <Tag className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Фото "Після"</p>
                <p className="text-2xl font-bold text-gray-900">
                  {afterPhotos.length}/3
                </p>
                {afterError && (
                  <p className="text-sm text-red-500">{afterError}</p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <RotateCcw className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Пари</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pairs.length}
                </p>
              </div>
            </div>
          </div>

          {/* Upload and Recreate Pairs */}
          <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
            <Button onClick={() => setShowUploadModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Додати фото "До/Після"
            </Button>
            <Button variant="outline" onClick={handleRecreatePairs}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Перестворити пари
            </Button>
          </div>

          {/* Before Photos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Фото "До"</h2>
            {beforeError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{beforeError}</p>
              </div>
            )}
            {beforePhotos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Немає фото "До". Додайте 3 фото.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }, (_, index) => {
                  const photo = beforePhotos[index];
                  return (
                    <div key={index} className="relative group">
                      {photo ? (
                        <>
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-48 object-cover rounded-lg shadow-md"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePhoto(photo.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="mt-2 text-sm font-medium text-gray-700">
                            {photo.title}
                          </p>
                        </>
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Порожнє місце</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* After Photos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Фото "Після"</h2>
            {afterError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{afterError}</p>
              </div>
            )}
            {afterPhotos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Немає фото "Після". Додайте 3 фото.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }, (_, index) => {
                  const photo = afterPhotos[index];
                  return (
                    <div key={index} className="relative group">
                      {photo ? (
                        <>
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-48 object-cover rounded-lg shadow-md"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePhoto(photo.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="mt-2 text-sm font-medium text-gray-700">
                            {photo.title}
                          </p>
                        </>
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Порожнє місце</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </h2>
        <div className="flex flex-wrap gap-2">
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbum(album)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedAlbum?.id === album.id
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {album.name}
            </button>
          ))}
        </div>
      </div>

      {selectedAlbum && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Фото "До"</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {beforePhotos.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Фото "Після"
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {afterPhotos.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Пари</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pairs.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Before Photos */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Фото "До" ({beforePhotos.length})
              </h2>
            </div>
            <div className="p-4">
              {beforePhotos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Немає фото "До"
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {beforePhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {photo.title}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          До
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* After Photos */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Фото "Після" ({afterPhotos.length})
              </h2>
            </div>
            <div className="p-4">
              {afterPhotos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Немає фото "Після"
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {afterPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {photo.title}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Після
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pairs */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Пари "До/Після" ({pairs.length})
              </h2>
            </div>
            <div className="p-4">
              {pairs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Немає пар. Додайте мінімум 3 фото "До" та 3 фото "Після" для
                  автоматичного створення пар.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pairs.map((pair) => (
                    <div key={pair.id} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {pair.label || `Пара ${pair.id}`}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            До
                          </h4>
                          {pair.beforePhoto ? (
                            <>
                              <img
                                src={pair.beforePhoto.imageUrl}
                                alt={pair.beforePhoto.title}
                                className="w-full h-32 object-cover rounded"
                              />
                              <p className="text-xs text-gray-600 mt-1">
                                {pair.beforePhoto.title}
                              </p>
                            </>
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-500">Немає фото</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Після
                          </h4>
                          {pair.afterPhoto ? (
                            <>
                              <img
                                src={pair.afterPhoto.imageUrl}
                                alt={pair.afterPhoto.title}
                                className="w-full h-32 object-cover rounded"
                              />
                              <p className="text-xs text-gray-600 mt-1">
                                {pair.afterPhoto.title}
                              </p>
                            </>
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-500">Немає фото</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePair(pair.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Видалити пару
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Завантажити фото
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип фото
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tag"
                      value="before"
                      checked={selectedTag === "before"}
                      onChange={(e) =>
                        setSelectedTag(e.target.value as "before")
                      }
                      className="mr-2"
                    />
                    До
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tag"
                      value="after"
                      checked={selectedTag === "after"}
                      onChange={(e) =>
                        setSelectedTag(e.target.value as "after")
                      }
                      className="mr-2"
                    />
                    Після
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Файл
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Назва
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Назва фото"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Опис
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опис фото"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex-1"
                >
                  {uploading ? "Завантаження..." : "Завантажити"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
