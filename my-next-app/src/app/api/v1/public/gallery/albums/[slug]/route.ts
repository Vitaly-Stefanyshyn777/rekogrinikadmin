import { NextRequest, NextResponse } from "next/server";

// Мок дані для публічних альбомів
const publicAlbums = [
  {
    id: 1,
    name: "Загальна галерея",
    description: "Основні роботи та проекти",
    slug: "general",
    createdAt: "2025-10-18T22:04:46.229Z",
    updatedAt: "2025-10-18T22:04:46.229Z",
  },
  {
    id: 2,
    name: "До/Після",
    description: "Порівняльні фото реконструкцій",
    slug: "before-after",
    createdAt: "2025-10-18T22:04:46.229Z",
    updatedAt: "2025-10-18T22:04:46.229Z",
  },
];

// Мок дані для фото
const publicPhotos = [
  {
    id: 1,
    albumId: 1,
    url: "https://res.cloudinary.com/dtgwh12jz/image/upload/v1760767146/rekogrinik/yluhpmrq2xi7ilo8rxel.png",
    title: "Приклад роботи 1",
    description: "Опис першої роботи",
    tag: "general",
    createdAt: "2025-10-18T22:00:00.000Z",
    updatedAt: "2025-10-18T22:00:00.000Z",
  },
  {
    id: 2,
    albumId: 2,
    url: "https://res.cloudinary.com/dtgwh12jz/image/upload/v1760767146/rekogrinik/yluhpmrq2xi7ilo8rxel.png",
    title: "До реконструкції",
    description: "Стан до початку робіт",
    tag: "before",
    createdAt: "2025-10-18T22:00:00.000Z",
    updatedAt: "2025-10-18T22:00:00.000Z",
  },
  {
    id: 3,
    albumId: 2,
    url: "https://res.cloudinary.com/dtgwh12jz/image/upload/v1760767146/rekogrinik/yluhpmrq2xi7ilo8rxel.png",
    title: "Після реконструкції",
    description: "Результат після завершення",
    tag: "after",
    createdAt: "2025-10-18T22:00:00.000Z",
    updatedAt: "2025-10-18T22:00:00.000Z",
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");

    // Знаходимо альбом за slug
    const album = publicAlbums.find((album) => album.slug === params.slug);
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Отримуємо фото альбому
    let albumPhotos = publicPhotos.filter(
      (photo) => photo.albumId === album.id
    );

    // Фільтруємо за тегом якщо вказано
    if (tag) {
      albumPhotos = albumPhotos.filter((photo) => photo.tag === tag);
    }

    return NextResponse.json({
      album,
      photos: albumPhotos,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch album" },
      { status: 500 }
    );
  }
}

