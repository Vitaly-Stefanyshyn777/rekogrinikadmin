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

// Тимчасовий мок для пар
let pairs: any[] = [
  {
    id: 1,
    albumId: 2,
    beforePhotos: [2],
    afterPhotos: [3],
    label: "Реконструкція кухні",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    albumId: 2,
    beforePhotos: [4, 5, 6],
    afterPhotos: [7, 8, 9],
    label: "Реконструкція ванної кімнати",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const albumId = parseInt(params.id);
    const albumPairs = pairs.filter((pair) => pair.albumId === albumId);

    return NextResponse.json(albumPairs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch album pairs" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const albumId = parseInt(params.id);

    const newPair = {
      id: Date.now(),
      albumId,
      ...body,
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

