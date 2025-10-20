import { NextResponse } from "next/server";

// Імпортуємо дані з адмінського API
let heroData: any = null;

// Функція для отримання Hero даних з адмінського API
async function getHeroData() {
  try {
    // Отримуємо дані з адмінського API
    const response = await fetch("http://localhost:3001/api/v1/hero");
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching hero data:", error);
    return null;
  }
}

export async function GET() {
  try {
    // Отримуємо актуальні дані
    const hero = await getHeroData();
    return NextResponse.json(hero);
  } catch (error) {
    return NextResponse.json({ error: "Hero not found" }, { status: 404 });
  }
}
