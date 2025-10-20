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

// Мок дані для пар
let pairs = [
  {
    id: 1,
    albumId: 2,
    beforePhotos: [2],
    afterPhotos: [3],
    label: "Реконструкція кухні",
    createdAt: "2025-10-18T22:17:55.699Z",
    updatedAt: "2025-10-18T22:17:55.699Z",
  },
  {
    id: 2,
    albumId: 2,
    beforePhotos: [4, 5, 6],
    afterPhotos: [7, 8, 9],
    label: "Реконструкція ванної кімнати",
    createdAt: "2025-10-18T22:17:55.699Z",
    updatedAt: "2025-10-18T22:17:55.699Z",
  },
];

export async function POST(request: NextRequest) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { albumId, beforePhotos, afterPhotos, label } = body;

    const newPair = {
      id: Date.now(),
      albumId,
      beforePhotos,
      afterPhotos,
      label,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    pairs.push(newPair);
    return NextResponse.json(newPair, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create pair" },
      { status: 500 }
    );
  }
}

