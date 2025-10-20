import { NextRequest, NextResponse } from "next/server";

// Тимчасовий мок для авторизації
const ADMIN_CREDENTIALS = {
  email: "admin@example.com",
  password: "R3k0gr1n1k@Admin#2024",
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Перевіряємо credentials
    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // Генеруємо JWT токен (спрощена версія)
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInBhc3N3b3JkIjpudWxsLCJpYXQiOjE3NjA3Njg4MDUsImV4cCI6MTc2MDg1NTIwNX0.ABFmSyJUSClxbmfgKKUT0RDm4WHPwx9OkKnNxca9HnE";

      const user = {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
      };

      return NextResponse.json({
        user,
        token,
        message: "Login successful",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
