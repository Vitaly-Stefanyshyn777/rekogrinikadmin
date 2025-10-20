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

// Глобальний масив для зберігання фото
let uploadedPhotos: any[] = [];

export async function POST(request: NextRequest) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const albumId = formData.get("albumId");
    const label = formData.get("label");

    if (!albumId) {
      return NextResponse.json(
        { error: "Album ID is required" },
        { status: 400 }
      );
    }

    const uploadedPhotos: any[] = [];

    // Обробляємо 3 фото "до"
    for (let i = 1; i <= 3; i++) {
      const beforeFile = formData.get(`beforePhoto${i}`) as File;
      if (beforeFile) {
        const arrayBuffer = await beforeFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const mimeType = beforeFile.type || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const photo = {
          id: Date.now() + i,
          albumId: parseInt(albumId as string),
          url: dataUrl,
          title: `До ${i}`,
          description: `Фото до реконструкції ${i}`,
          tag: "before",
          fileName: beforeFile.name,
          fileSize: beforeFile.size,
          mimeType: beforeFile.type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        uploadedPhotos.push(photo);
      }
    }

    // Обробляємо 3 фото "після"
    for (let i = 1; i <= 3; i++) {
      const afterFile = formData.get(`afterPhoto${i}`) as File;
      if (afterFile) {
        const arrayBuffer = await afterFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const mimeType = afterFile.type || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const photo = {
          id: Date.now() + 100 + i,
          albumId: parseInt(albumId as string),
          url: dataUrl,
          title: `Після ${i}`,
          description: `Фото після реконструкції ${i}`,
          tag: "after",
          fileName: afterFile.name,
          fileSize: afterFile.size,
          mimeType: afterFile.type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        uploadedPhotos.push(photo);
      }
    }

    // Створюємо пару з 6 фото
    const beforePhotoIds = uploadedPhotos
      .filter((p) => p.tag === "before")
      .map((p) => p.id);
    const afterPhotoIds = uploadedPhotos
      .filter((p) => p.tag === "after")
      .map((p) => p.id);

    const pair = {
      id: Date.now() + 1000,
      albumId: parseInt(albumId as string),
      beforePhotos: beforePhotoIds,
      afterPhotos: afterPhotoIds,
      label: (label as string) || "Нова реконструкція",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        photos: uploadedPhotos,
        pair: pair,
        message: "Successfully uploaded 6 photos and created pair",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload batch photos" },
      { status: 500 }
    );
  }
}

