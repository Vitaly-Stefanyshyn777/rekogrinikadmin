"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { galleryApi, Album, Photo, BeforeAfterPair } from "@/lib/api";
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

export default function BeforeAfterGroupedPage() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const api = useApi();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pairs, setPairs] = useState<BeforeAfterPair[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingPairs, setLoadingPairs] = useState(false);
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [albumForm, setAlbumForm] = useState({ name: "", slug: "" });
  const [showAddPair, setShowAddPair] = useState(false);
  const [pairForm, setPairForm] = useState({
    beforePhotoId: "",
    afterPhotoId: "",
    label: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Стан для 3 фото "До"
  const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
  const [beforePhotoUrls, setBeforePhotoUrls] = useState<string[]>([]);
  const [uploadingBefore, setUploadingBefore] = useState(false);

  // Стан для 3 фото "Після"
  const [afterFiles, setAfterFiles] = useState<File[]>([]);
  const [afterPhotoUrls, setAfterPhotoUrls] = useState<string[]>([]);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  // Стан для групування
  const [groupBy, setGroupBy] = useState<"tag" | "pair">("tag");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      loadPhotos(selectedAlbum.id);
      loadPairs(selectedAlbum.id);
    } else {
      setPhotos([]);
      setPairs([]);
    }
  }, [selectedAlbum]);

  const loadAlbums = async () => {
    setLoadingAlbums(true);
    try {
      const response = await galleryApi.getAlbums();
      setAlbums(response.data);
      if (response.data.length > 0 && !selectedAlbum) {
        setSelectedAlbum(response.data[0]);
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
      const response = await galleryApi.getPhotos(albumId);
      setPhotos(response.data);
    } catch (error) {
      toast.error("Помилка завантаження фото");
    } finally {
      setLoadingPhotos(false);
    }
  };

  const loadPairs = async (albumId: string) => {
    try {
      setLoadingPairs(true);
      const response = await galleryApi.getPairs(albumId);
      setPairs(response.data);
    } catch (error) {
      toast.error("Помилка завантаження пар");
    } finally {
      setLoadingPairs(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити це фото?")) return;

    try {
      await galleryApi.deletePhoto(photoId);
      toast.success("Фото видалено");
      if (selectedAlbum) {
        loadPhotos(selectedAlbum.id);
        loadPairs(selectedAlbum.id);
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
        loadPairs(selectedAlbum.id);
      }
    } catch (error) {
      toast.error("Помилка видалення пари");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">
            До/Після галерея з групуванням
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Управління галереєю до/після з групуванням фото за мітками
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowAddAlbum(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Додати альбом
          </Button>
          {selectedAlbum && (
            <Button onClick={() => setShowAddPair(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Створити пару
            </Button>
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
                  variant={groupBy === "tag" ? "default" : "secondary"}
                  onClick={() => setGroupBy("tag")}
                  size="sm"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  За мітками
                </Button>
                <Button
                  variant={groupBy === "pair" ? "default" : "secondary"}
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
              {albums.length === 0 ? (
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

        {/* Фото з групуванням */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedAlbum
                  ? `Фото в альбомі "${selectedAlbum.name}"`
                  : "Оберіть альбом"}
              </h3>

              {loadingPhotos ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-32 w-32 bg-gray-200 rounded-lg"
                    ></div>
                  ))}
                </div>
              ) : photos.length > 0 ? (
                <GroupedPhotos
                  photos={photos}
                  onDeletePhoto={handleDeletePhoto}
                  showTag={true}
                  groupBy={groupBy}
                />
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
    </div>
  );
}

