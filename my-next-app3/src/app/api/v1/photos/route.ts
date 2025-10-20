import { NextRequest, NextResponse } from "next/server";
import {
  getAllPhotos,
  deletePhotoById,
  updatePhotoById,
} from "@/lib/photoStorage";

// Функція для перевірки авторизації
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  // Тут має бути реальна перевірка JWT токена
  return token.length > 0;
}

// GET - отримати всі фото
export async function GET(request: NextRequest) {
  console.log("🔍 GET /api/v1/photos - Отримання всіх фото");

  if (!checkAuth(request)) {
    console.log("❌ GET /api/v1/photos - Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const photos = getAllPhotos();
  console.log(`✅ GET /api/v1/photos - Знайдено ${photos.length} фото`);
  return NextResponse.json({
    photos,
    total: photos.length,
  });
}

// DELETE - видалити фото за ID
export async function DELETE(request: NextRequest) {
  console.log("🗑️ DELETE /api/v1/photos - Видалення фото");

  if (!checkAuth(request)) {
    console.log("❌ DELETE /api/v1/photos - Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get("id");

  if (!photoId) {
    return NextResponse.json(
      { error: "Photo ID is required" },
      { status: 400 }
    );
  }

  const deletedPhoto = deletePhotoById(parseInt(photoId));
  if (!deletedPhoto) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  console.log(`✅ DELETE /api/v1/photos - Видалено фото ${photoId}`);

  return NextResponse.json({
    message: "Photo deleted successfully",
    deletedPhoto,
  });
}

// PUT - оновити метадані фото
export async function PUT(request: NextRequest) {
  console.log("✏️ PUT /api/v1/photos - Оновлення фото");

  if (!checkAuth(request)) {
    console.log("❌ PUT /api/v1/photos - Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, title, description, tag } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Photo ID is required" },
      { status: 400 }
    );
  }

  const updatedPhoto = updatePhotoById(id, {
    title,
    description,
    tag,
  });

  if (!updatedPhoto) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  console.log(`✅ PUT /api/v1/photos - Оновлено фото ${id}`);

  return NextResponse.json({
    message: "Photo updated successfully",
    photo: updatedPhoto,
  });
}
