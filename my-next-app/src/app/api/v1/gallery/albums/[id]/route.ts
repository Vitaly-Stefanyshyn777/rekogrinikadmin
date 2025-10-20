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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const albumId = parseInt(params.id);
    const body = await request.json();
    const { name, description, slug } = body;

    const albumIndex = albums.findIndex((album) => album.id === albumId);
    if (albumIndex === -1) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    albums[albumIndex] = {
      ...albums[albumIndex],
      name,
      description,
      slug,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(albums[albumIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update album" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const albumId = parseInt(params.id);
    const albumIndex = albums.findIndex((album) => album.id === albumId);

    if (albumIndex === -1) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    albums.splice(albumIndex, 1);
    return NextResponse.json({ message: "Album deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete album" },
      { status: 500 }
    );
  }
}

