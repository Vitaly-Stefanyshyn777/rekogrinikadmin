import { NextRequest, NextResponse } from "next/server";

// Функція для перевірки авторизації
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7);

  // Проста перевірка токена
  return (
    token ===
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInBhc3N3b3JkIjpudWxsLCJpYXQiOjE3NjA3Njg4MDUsImV4cCI6MTc2MDg1NTIwNX0.ABFmSyJUSClxbmfgKKUT0RDm4WHPwx9OkKnNxca9HnE"
  );
}

// Мок дані для альбомів
let albums = [
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
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(albums);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, slug } = body;

    const newAlbum = {
      id: Date.now(),
      name,
      description,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    albums.push(newAlbum);
    return NextResponse.json(newAlbum, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}
