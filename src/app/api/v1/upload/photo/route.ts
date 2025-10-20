import { NextRequest, NextResponse } from "next/server";
import { addPhoto } from "@/lib/photoStorage";

// Функція для перевірки авторизації
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7);

  // Проста перевірка токена
  return token.length > 0;
}

export async function POST(request: NextRequest) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const albumId = formData.get("albumId");
    const title = formData.get("title");
    const description = formData.get("description");
    const tag = formData.get("tag");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!albumId) {
      return NextResponse.json(
        { error: "Album ID is required" },
        { status: 400 }
      );
    }

    // Читаємо файл як ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Конвертуємо в base64 для зберігання
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const photo = {
      id: Date.now(),
      albumId: parseInt(albumId as string),
      url: dataUrl, // Зберігаємо реальне зображення як data URL
      title: title as string,
      description: description as string,
      tag: tag as string,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Додаємо фото до глобального масиву через спільну функцію
    addPhoto(photo);

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/v1/upload/photo - Помилка:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
