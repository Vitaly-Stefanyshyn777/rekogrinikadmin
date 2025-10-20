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

// GET - отримати всі альбоми (адмін)
export async function GET(request: NextRequest) {
  console.log(
    "🔐 GET /api/v1/gallery/albums - Отримання всіх альбомів (адмін)"
  );

  if (!checkAuth(request)) {
    console.log("❌ GET /api/v1/gallery/albums - Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const photos = getAllPhotos();

    // Визначені альбоми
    const predefinedAlbums = [
      { id: 1, name: "Звичайна галерея", slug: "general", type: "GENERAL" },
      { id: 2, name: "До і Після", slug: "before-after", type: "BEFORE_AFTER" },
    ];

    // Підраховуємо фото для кожного альбому
    const albums = predefinedAlbums.map((album) => ({
      ...album,
      photoCount: photos.filter((photo) => photo.albumId === album.id).length,
    }));

    console.log(
      `✅ GET /api/v1/gallery/albums - Знайдено ${albums.length} альбомів`
    );

    return NextResponse.json({
      albums,
      total: albums.length,
    });
  } catch (error) {
    console.error("❌ GET /api/v1/gallery/albums - Помилка:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

