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

// GET - отримати пари "До і Після" (адмін)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;

  console.log(
    `🔐 GET /api/v1/gallery/albums/${albumId}/pairs - Отримання пар "До і Після"`
  );

  if (!checkAuth(request)) {
    console.log("❌ GET /api/v1/gallery/albums/[albumId]/pairs - Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const photos = getAllPhotos();
    const albumIdNum = parseInt(albumId);

    // Фільтруємо фото по альбому
    const albumPhotos = photos.filter((photo) => photo.albumId === albumIdNum);

    // Розділяємо на "до" та "після"
    const beforePhotos = albumPhotos.filter((photo) => photo.tag === "before");
    const afterPhotos = albumPhotos.filter((photo) => photo.tag === "after");

    // Створюємо пари (простий алгоритм - по порядку)
    const pairs = [];
    const minLength = Math.min(beforePhotos.length, afterPhotos.length);

    for (let i = 0; i < minLength; i++) {
      pairs.push({
        id: i + 1,
        beforePhoto: beforePhotos[i],
        afterPhoto: afterPhotos[i],
        collectionId: Math.floor(i / 3) + 1, // Групуємо по 3 пари в колекцію
      });
    }

    // Створюємо колекції
    const collectionsMap = new Map();
    pairs.forEach((pair) => {
      const collectionId = pair.collectionId;
      if (!collectionsMap.has(collectionId)) {
        collectionsMap.set(collectionId, {
          id: collectionId,
          pairs: [],
          count: 0,
        });
      }
      collectionsMap.get(collectionId).pairs.push(pair);
      collectionsMap.get(collectionId).count++;
    });

    const collections = Array.from(collectionsMap.values());

    console.log(
      `✅ GET /api/v1/gallery/albums/${albumId}/pairs - Знайдено ${pairs.length} пар`
    );

    return NextResponse.json({
      pairs,
      collections,
      total: pairs.length,
      albumId: albumIdNum,
    });
  } catch (error) {
    console.error(
      `❌ GET /api/v1/gallery/albums/${albumId}/pairs - Помилка:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch pairs" },
      { status: 500 }
    );
  }
}

