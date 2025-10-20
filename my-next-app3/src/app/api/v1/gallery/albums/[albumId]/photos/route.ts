import { NextRequest, NextResponse } from "next/server";
import { getAllPhotos } from "@/lib/photoStorage";

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return (
    token ===
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInBhc3N3b3JkIjpudWxsLCJpYXQiOjE3NjA3Njg4MDUsImV4cCI6MTc2MDg1NTIwNX0.ABFmSyJUSClxbmfgKKUT0RDm4WHPwx9OkKnNxca9HnE"
  );
}

// GET - отримати фото альбому (адмін)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  console.log(
    `🔐 GET /api/v1/gallery/albums/${albumId}/photos - Отримання фото альбому з фільтром: ${
      tag || "всі"
    }`
  );

  if (!checkAuth(request)) {
    console.log(
      "❌ GET /api/v1/gallery/albums/[albumId]/photos - Unauthorized"
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const photos = getAllPhotos();
    const albumIdNum = parseInt(albumId);

    // Фільтруємо фото по альбому
    let albumPhotos = photos.filter((photo) => photo.albumId === albumIdNum);

    // Додаткова фільтрація по тегу
    if (tag) {
      albumPhotos = albumPhotos.filter((photo) => photo.tag === tag);
    }

    console.log(
      `✅ GET /api/v1/gallery/albums/${albumId}/photos - Знайдено ${albumPhotos.length} фото`
    );

    return NextResponse.json({
      photos: albumPhotos,
      total: albumPhotos.length,
      albumId: albumIdNum,
      tag: tag || "all",
    });
  } catch (error) {
    console.error(
      `❌ GET /api/v1/gallery/albums/${albumId}/photos - Помилка:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

