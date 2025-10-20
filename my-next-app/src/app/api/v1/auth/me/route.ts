import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Проста перевірка токена (в реальному проекті тут була б валідація JWT)
    if (
      token ===
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInBhc3N3b3JkIjpudWxsLCJpYXQiOjE3NjA3Njg4MDUsImV4cCI6MTc2MDg1NTIwNX0.ABFmSyJUSClxbmfgKKUT0RDm4WHPwx9OkKnNxca9HnE"
    ) {
      const user = {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
      };

      return NextResponse.json({ user });
    } else {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

