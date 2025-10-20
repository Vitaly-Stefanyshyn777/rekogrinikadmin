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

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(publicAlbums);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

