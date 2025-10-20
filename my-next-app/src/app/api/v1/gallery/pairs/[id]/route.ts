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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pairId = parseInt(params.id);
    const pairIndex = pairs.findIndex((pair) => pair.id === pairId);

    if (pairIndex === -1) {
      return NextResponse.json({ error: "Pair not found" }, { status: 404 });
    }

    pairs.splice(pairIndex, 1);
    return NextResponse.json({ message: "Pair deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete pair" },
      { status: 500 }
    );
  }
}

