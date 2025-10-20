# 🎯 Hero блок - Динамічний контент

## 📋 **Огляд Hero блоку:**

### **Структура Hero блоку:**

- **title** - H1 заголовок (обов'язково)
- **subtitle** - Підзаголовок (обов'язково)
- **backgroundImage** - Фонове зображення (опціонально)

### **Приклад контенту:**

```
title: "RekoGrinik – Rekonstrukce bytů a domů v Praze"
subtitle: "Kompletní rekonstrukce na klíč, pevné rozpočty a termíny"
backgroundImage: "https://example.com/hero-bg.jpg"
```

---

## 🔧 **Реалізація:**

### **1. Інтерфейс HeroBlock:**

```typescript
export interface HeroBlock {
  id: string;
  title: string; // H1 заголовок
  subtitle: string; // Підзаголовок
  backgroundImage?: string; // Фонове зображення (опціонально)
  createdAt: string;
  updatedAt: string;
}
```

### **2. API endpoints:**

#### **Admin API (з авторизацією):**

```typescript
// Отримати Hero блок
GET /api/v1/hero

// Створити Hero блок
POST /api/v1/hero
{
  "title": "RekoGrinik – Rekonstrukce bytů a domů v Praze",
  "subtitle": "Kompletní rekonstrukce na klíč, pevné rozpočty a termíny",
  "backgroundImage": "https://example.com/hero-bg.jpg"
}

// Оновити Hero блок
PUT /api/v1/hero
{
  "title": "Новий заголовок",
  "subtitle": "Новий підзаголовок"
}

// Видалити Hero блок
DELETE /api/v1/hero
```

#### **Public API (без авторизації):**

```typescript
// Отримати Hero блок для публічної сторінки
GET / api / v1 / public / hero;
```

### **3. API клієнт:**

```typescript
// Hero API
export const heroApi = {
  get: () => api.get<HeroBlock>("/hero"),

  create: (data: Omit<HeroBlock, "id" | "createdAt" | "updatedAt">) =>
    api.post<HeroBlock>("/hero", data),

  update: (data: Partial<Omit<HeroBlock, "id" | "createdAt" | "updatedAt">>) =>
    api.put<HeroBlock>("/hero", data),

  delete: () => api.delete("/hero"),
};

// Public API
export const publicApi = {
  getHero: () => api.get<HeroBlock>("/public/hero"),
  // ... інші публічні API
};
```

---

## 🎨 **Візуальне оформлення:**

### **1. Без фонового зображення:**

```html
<div
  class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg"
>
  <h1 class="text-3xl font-bold mb-4">
    RekoGrinik – Rekonstrukce bytů a domů v Praze
  </h1>
  <p class="text-lg opacity-90">
    Kompletní rekonstrukce na klíč, pevné rozpočty a termíny
  </p>
</div>
```

### **2. З фоновим зображенням:**

```html
<div class="relative">
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-lg"
    style="background-image: url(hero-bg.jpg)"
  >
    <div class="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
  </div>
  <div class="relative p-8 rounded-lg text-white">
    <h1 class="text-3xl font-bold mb-4">
      RekoGrinik – Rekonstrukce bytů a domů v Praze
    </h1>
    <p class="text-lg opacity-90">
      Kompletní rekonstrukce na klíč, pevné rozpočty a termíny
    </p>
  </div>
</div>
```

---

## 🚀 **Бекенд реалізація:**

### **1. Модель Hero (Prisma):**

```prisma
model Hero {
  id            String   @id @default(cuid())
  title         String
  subtitle      String
  backgroundImage String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("hero")
}
```

### **2. Контролер Hero:**

```typescript
// GET /api/v1/hero
export async function GET() {
  try {
    const hero = await prisma.hero.findFirst();
    return NextResponse.json(hero);
  } catch (error) {
    return NextResponse.json({ error: "Hero not found" }, { status: 404 });
  }
}

// POST /api/v1/hero
export async function POST(request: Request) {
  try {
    const { title, subtitle, backgroundImage } = await request.json();

    // Видаляємо існуючий Hero (тільки один може бути)
    await prisma.hero.deleteMany();

    const hero = await prisma.hero.create({
      data: { title, subtitle, backgroundImage },
    });

    return NextResponse.json(hero);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create hero" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hero
export async function PUT(request: Request) {
  try {
    const { title, subtitle, backgroundImage } = await request.json();

    const hero = await prisma.hero.findFirst();
    if (!hero) {
      return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    const updatedHero = await prisma.hero.update({
      where: { id: hero.id },
      data: { title, subtitle, backgroundImage },
    });

    return NextResponse.json(updatedHero);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update hero" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hero
export async function DELETE() {
  try {
    await prisma.hero.deleteMany();
    return NextResponse.json({ message: "Hero deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete hero" },
      { status: 500 }
    );
  }
}
```

### **3. Публічний API:**

```typescript
// GET /api/v1/public/hero
export async function GET() {
  try {
    const hero = await prisma.hero.findFirst();
    return NextResponse.json(hero);
  } catch (error) {
    return NextResponse.json({ error: "Hero not found" }, { status: 404 });
  }
}
```

---

## 📊 **Використання на фронтенді:**

### **1. Адмін панель:**

```typescript
// Завантаження Hero блоку
const loadHeroBlock = async () => {
  try {
    const response = await heroApi.get();
    setHeroBlock(response.data);
  } catch (error) {
    console.log("Hero блок не знайдено");
  }
};

// Збереження Hero блоку
const handleSaveHero = async (heroData) => {
  if (heroBlock) {
    await heroApi.update(heroData);
  } else {
    await heroApi.create(heroData);
  }
};
```

### **2. Публічна сторінка:**

```typescript
// Отримання Hero блоку для відображення
const loadHeroForPublic = async () => {
  try {
    const response = await publicApi.getHero();
    setHeroData(response.data);
  } catch (error) {
    console.error("Помилка завантаження Hero блоку");
  }
};
```

---

## 🎯 **Переваги Hero блоку:**

### **1. Динамічність:**

- ✅ **Зміна контенту** без перезапуску сайту
- ✅ **Швидке оновлення** через адмін панель
- ✅ **Гнучкість** - можна додати/прибрати фонове зображення

### **2. UX:**

- ✅ **Попередній перегляд** - бачите як виглядатиме
- ✅ **Валідація** - обов'язкові поля
- ✅ **Завантаження зображень** - інтеграція з upload API

### **3. Технічні переваги:**

- ✅ **Один Hero блок** - тільки один може бути активним
- ✅ **Автоматичне видалення** старого при створенні нового
- ✅ **Публічний API** - безпечний доступ для фронтенду

---

## 📋 **Структура бази даних:**

### **Таблиця `hero`:**

```sql
CREATE TABLE hero (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT NOT NULL,
  backgroundImage VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Приклад даних:**

```json
{
  "id": "hero_123",
  "title": "RekoGrinik – Rekonstrukce bytů a domů v Praze",
  "subtitle": "Kompletní rekonstrukce na klíč, pevné rozpočty a termíny",
  "backgroundImage": "https://example.com/hero-bg.jpg",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Результат:** Повноцінний Hero блок з динамічним контентом! 🎉

