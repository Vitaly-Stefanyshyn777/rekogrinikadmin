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

export async function POST(request: NextRequest) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { albumId, url, title, description, tag } = body;

    const newPhoto = {
      id: Date.now(),
      albumId,
      url,
      title,
      description,
      tag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    photos.push(newPhoto);
    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create photo" },
      { status: 500 }
    );
  }
}
