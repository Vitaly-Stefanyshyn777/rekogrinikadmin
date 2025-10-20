"use client";

import { useState, useEffect } from "react";
import { Save, Edit, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { apiClient } from "@/lib/api";

interface Hero {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentBlock {
  id: string;
  blockNumber: number;
  name: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContentPage() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "content">("hero");

  // Hero form state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroBackgroundImage, setHeroBackgroundImage] = useState("");

  // Content form state
  const [newBlock, setNewBlock] = useState({
    blockNumber: 0,
    name: "",
    text: "",
    imageUrl: "",
  });
  const [showContentForm, setShowContentForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [heroResponse, contentResponse] = await Promise.all([
        apiClient.getHero(),
        apiClient.getContent(),
      ]);

      if (heroResponse.data) {
        setHero(heroResponse.data);
        setHeroTitle(heroResponse.data.title || "");
        setHeroSubtitle(heroResponse.data.subtitle || "");
        setHeroBackgroundImage(heroResponse.data.backgroundImage || "");
      }

      if (contentResponse.data) {
        setContentBlocks(contentResponse.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHero = async () => {
    setSaving(true);
    try {
      if (hero) {
        // Update existing hero
        await apiClient.updateHero({
          title: heroTitle,
          subtitle: heroSubtitle,
          backgroundImage: heroBackgroundImage,
        });
      } else {
        // Create new hero
        await apiClient.createHero({
          title: heroTitle,
          subtitle: heroSubtitle,
          backgroundImage: heroBackgroundImage,
        });
      }
      loadData();
    } catch (error) {
      console.error("Error saving hero:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateContentBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.createContent(newBlock);
      setNewBlock({ blockNumber: 0, name: "", text: "", imageUrl: "" });
      setShowContentForm(false);
      loadData();
    } catch (error) {
      console.error("Error creating content block:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContentBlock = async (
    id: string,
    data: Partial<ContentBlock>
  ) => {
    setSaving(true);
    try {
      await apiClient.updateContent(id, data);
      loadData();
    } catch (error) {
      console.error("Error updating content block:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContentBlock = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей блок контенту?")) return;

    setSaving(true);
    try {
      await apiClient.deleteContent(id);
      loadData();
    } catch (error) {
      console.error("Error deleting content block:", error);
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Контент</h1>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "hero" ? "default" : "outline"}
            onClick={() => setActiveTab("hero")}
          >
            Hero секція
          </Button>
          <Button
            variant={activeTab === "content" ? "default" : "outline"}
            onClick={() => setActiveTab("content")}
          >
            Контент блоки
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      {activeTab === "hero" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Hero секція
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок (H1)
                </label>
                <Input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Введіть заголовок"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Підзаголовок (P)
                </label>
                <Textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Введіть підзаголовок"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL фонового зображення
                </label>
                <Input
                  value={heroBackgroundImage}
                  onChange={(e) => setHeroBackgroundImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {heroBackgroundImage && (
                  <img
                    src={heroBackgroundImage}
                    alt="Background preview"
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveHero} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Збереження..." : "Зберегти Hero"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Blocks */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Контент блоки
                </h2>
                <Button onClick={() => setShowContentForm(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Додати блок
                </Button>
              </div>

              {contentBlocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Немає контент блоків
                </div>
              ) : (
                <div className="space-y-4">
                  {contentBlocks.map((block) => (
                    <div key={block.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {block.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Блок #{block.blockNumber}
                          </p>
                          <p className="text-gray-700 mt-2">{block.text}</p>
                          {block.imageUrl && (
                            <img
                              src={block.imageUrl}
                              alt={block.name}
                              className="mt-2 w-full h-32 object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // TODO: Implement edit functionality
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteContentBlock(block.id)}
                          >
                            Видалити
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Content Block Form */}
          {showContentForm && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Додати новий блок
                </h3>
                <form onSubmit={handleCreateContentBlock} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Номер блоку
                    </label>
                    <Input
                      type="number"
                      value={newBlock.blockNumber}
                      onChange={(e) =>
                        setNewBlock({
                          ...newBlock,
                          blockNumber: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Назва блоку
                    </label>
                    <Input
                      value={newBlock.name}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, name: e.target.value })
                      }
                      placeholder="Назва блоку"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Текст
                    </label>
                    <Textarea
                      value={newBlock.text}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, text: e.target.value })
                      }
                      placeholder="Текст блоку"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL зображення
                    </label>
                    <Input
                      value={newBlock.imageUrl}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, imageUrl: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowContentForm(false)}
                    >
                      Скасувати
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Створення..." : "Створити блок"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

