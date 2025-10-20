import { NextResponse } from "next/server";

// Тимчасовий мок для Content API
let contentBlocks: any[] = [
  {
    id: "1",
    blockNumber: 1,
    name: "Головний заголовок",
    text: "Ласкаво просимо до RekoGrinik - вашої надійної компанії з реконструкції будинків та квартир у Празі. Ми спеціалізуємося на повній реконструкції на ключ з гарантованими термінами та фіксованими цінами.",
    imageUrl:
      "https://res.cloudinary.com/dtgwh12jz/image/upload/v1760767146/rekogrinik/yluhpmrq2xi7ilo8rxel.png",
    imagePublicId: "welcome_public_id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    blockNumber: 2,
    name: "Про нас",
    text: "RekoGrinik - це команда професіоналів з багаторічним досвідом у сфері реконструкції. Ми гарантуємо якість, дотримання термінів та прозорість у всіх етапах роботи. Наші проекти включають повну реконструкцію квартир, будинків, офісів та комерційних приміщень.",
    imageUrl:
      "https://res.cloudinary.com/dtgwh12jz/image/upload/v1760767146/rekogrinik/yluhpmrq2xi7ilo8rxel.png",
    imagePublicId: "about_public_id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    blockNumber: 3,
    name: "Наші послуги",
    text: "• Повна реконструкція квартир та будинків\n• Ремонт ванних кімнат та кухонь\n• Оздоблення офісів та комерційних приміщень\n• Електромонтажні та сантехнічні роботи\n• Покрівельні роботи та утеплення\n• Ландшафтний дизайн та благоустрій",
    imageUrl:
      "https://res.cloudinary.com/dtgwh12jz/image/upload/v1760767146/rekogrinik/yluhpmrq2xi7ilo8rxel.png",
    imagePublicId: "services_public_id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    return NextResponse.json(contentBlocks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch content blocks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBlock = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    contentBlocks.push(newBlock);
    return NextResponse.json(newBlock, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create content block" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const body = await request.json();

    const blockIndex = contentBlocks.findIndex((block) => block.id === id);
    if (blockIndex === -1) {
      return NextResponse.json(
        { error: "Content block not found" },
        { status: 404 }
      );
    }

    contentBlocks[blockIndex] = {
      ...contentBlocks[blockIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(contentBlocks[blockIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update content block" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const blockIndex = contentBlocks.findIndex((block) => block.id === id);
    if (blockIndex === -1) {
      return NextResponse.json(
        { error: "Content block not found" },
        { status: 404 }
      );
    }

    contentBlocks.splice(blockIndex, 1);
    return NextResponse.json({ message: "Content block deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete content block" },
      { status: 500 }
    );
  }
}
