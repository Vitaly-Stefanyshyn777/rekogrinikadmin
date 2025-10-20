import { NextRequest, NextResponse } from "next/server";

// Тимчасовий мок для Hero API
let heroData: any = null;

export async function GET() {
  try {
    return NextResponse.json(heroData);
  } catch (error) {
    return NextResponse.json({ error: "Hero not found" }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, subtitle, backgroundImage } = await request.json();

    heroData = {
      id: "hero_mock_1",
      title,
      subtitle,
      backgroundImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(heroData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create hero" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { title, subtitle, backgroundImage } = await request.json();

    if (!heroData) {
      return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    heroData = {
      ...heroData,
      title,
      subtitle,
      backgroundImage,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(heroData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update hero" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    heroData = null;
    return NextResponse.json({ message: "Hero deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete hero" },
      { status: 500 }
    );
  }
}

