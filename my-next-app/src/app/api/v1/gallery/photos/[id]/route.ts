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

// Мок дані для фото
let photos = [
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

    const photoId = parseInt(params.id);
    const body = await request.json();
    const { title, description, tag } = body;

    const photoIndex = photos.findIndex((photo) => photo.id === photoId);
    if (photoIndex === -1) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    photos[photoIndex] = {
      ...photos[photoIndex],
      title,
      description,
      tag,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(photos[photoIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update photo" },
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

    const photoId = parseInt(params.id);
    const photoIndex = photos.findIndex((photo) => photo.id === photoId);

    if (photoIndex === -1) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    photos.splice(photoIndex, 1);
    return NextResponse.json({ message: "Photo deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}

