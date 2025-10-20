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

export async function POST(request: NextRequest) {
  try {
    // Перевіряємо авторизацію
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Симулюємо завантаження на Cloudinary
    const fileUrl = `https://res.cloudinary.com/dtgwh12jz/image/upload/v1760767146/rekogrinik/${Date.now()}.jpg`;
    const publicId = `rekogrinik_${Date.now()}`;

    return NextResponse.json({
      url: fileUrl,
      publicId: publicId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

