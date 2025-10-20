"use client";

import { useState, useEffect } from "react";
import { Plus, Upload, Trash2, Edit } from "lucide-react";
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

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      loadPhotos(selectedAlbum.id);
    }
  }, [selectedAlbum]);

  const loadAlbums = async () => {
    try {
      const response = await apiClient.getAlbums();
      if (response.data) {
        setAlbums(response.data);
        if (response.data.length > 0) {
          setSelectedAlbum(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPhotos = async (albumId: string) => {
    try {
      const response = await apiClient.getAlbumPhotos(albumId);
      if (response.data) {
        setPhotos(response.data);
      }
    } catch (error) {
      console.error("Error loading photos:", error);
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
      formData.append("title", title);
      formData.append("description", description);

      const response = await apiClient.uploadPhoto(formData);
      if (response.data) {
        setShowUploadModal(false);
        setFile(null);
        setTitle("");
        setDescription("");
        setPreview(null);
        loadPhotos(selectedAlbum.id);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити це фото?")) return;

    try {
      await apiClient.deletePhoto(photoId);
      loadPhotos(selectedAlbum!.id);
    } catch (error) {
      console.error("Error deleting photo:", error);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Галерея</h1>
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Додати фото
        </Button>
      </div>

      {/* Album selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Альбоми</h2>
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

      {/* Photos grid */}
      {selectedAlbum && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Фото в альбомі "{selectedAlbum.name}"
            </h2>
          </div>
          <div className="p-4">
            {photos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Немає фото в цьому альбомі
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {photos.map((photo) => (
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
                      {photo.tag && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {photo.tag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

