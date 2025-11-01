import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:3002";

// PUT - проксувати запит до backend для заміни фото "До" в парі
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pairId: string }> }
) {
  const { pairId } = await params;

  console.log(
    `🔄 PUT /api/v1/upload/pairs/${pairId}/before - Проксування до backend`
  );

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Отримуємо FormData з запиту
    const formData = await request.formData();

    // Проксуємо запит до backend
    const backendUrl = `${BACKEND_URL}/api/v1/upload/pairs/${pairId}/before`;

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ PUT /api/v1/upload/pairs/${pairId}/before - Backend error: ${response.status}`,
        errorText
      );
      return NextResponse.json(
        { error: errorText || "Backend replacement failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(
      `✅ PUT /api/v1/upload/pairs/${pairId}/before - Фото замінено через backend`
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      `❌ PUT /api/v1/upload/pairs/${pairId}/before - Помилка:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to replace photo in backend" },
      { status: 500 }
    );
  }
}

