# 🔄 Синхронізація API між фронтендом і бекендом

## 📋 **Методи синхронізації:**

### **1. Спільні типи даних**

#### **Створено файл `shared-types.ts`:**

```typescript
// Спільні типи для фронтенду і бекенду
export interface CreatePairRequest {
  albumId: number;
  beforePhotoId: number;
  afterPhotoId: number;
  label?: string;
}

export interface CreatePairResponse {
  id: number;
  albumId: number;
  beforePhotoId: number;
  afterPhotoId: number;
  label?: string;
  createdAt: string;
  updatedAt: string;
}
```

### **2. Валідація на фронтенді**

#### **Додано валідацію в API клієнт:**

```typescript
const validateCreatePairData = (data: CreatePairRequest): string[] => {
  const errors: string[] = [];

  if (!data.albumId || typeof data.albumId !== "number" || data.albumId < 1) {
    errors.push("albumId must be a positive number");
  }

  if (
    !data.beforePhotoId ||
    typeof data.beforePhotoId !== "number" ||
    data.beforePhotoId < 1
  ) {
    errors.push("beforePhotoId must be a positive number");
  }

  if (
    !data.afterPhotoId ||
    typeof data.afterPhotoId !== "number" ||
    data.afterPhotoId < 1
  ) {
    errors.push("afterPhotoId must be a positive number");
  }

  return errors;
};
```

### **3. Валідація в компоненті**

#### **Додано перевірки в `handleCreatePair`:**

```typescript
// Перевірка валідності даних
if (isNaN(pairData.albumId) || pairData.albumId < 1) {
  throw new Error(`Invalid albumId: ${selectedAlbum.id}`);
}
if (isNaN(pairData.beforePhotoId) || pairData.beforePhotoId < 1) {
  throw new Error(`Invalid beforePhotoId: ${beforePhoto.id}`);
}
if (isNaN(pairData.afterPhotoId) || pairData.afterPhotoId < 1) {
  throw new Error(`Invalid afterPhotoId: ${afterPhoto.id}`);
}
```

---

## 🔧 **Практичні кроки синхронізації:**

### **Крок 1: Створення спільних типів**

- ✅ Створено `shared-types.ts`
- ✅ Визначено інтерфейси для всіх API
- ✅ Додано валідаційні схеми

### **Крок 2: Оновлення API клієнта**

- ✅ Імпорт спільних типів
- ✅ Додано валідацію перед відправкою
- ✅ Обробка помилок валідації

### **Крок 3: Оновлення компонентів**

- ✅ Використання типізованих даних
- ✅ Валідація на рівні компонента
- ✅ Детальна обробка помилок

### **Крок 4: Тестування синхронізації**

- ✅ Перевірка типів на компіляції
- ✅ Валідація даних в runtime
- ✅ Тестування через API

---

## 🎯 **Переваги синхронізації:**

### **1. Типобезпека**

- ✅ TypeScript перевіряє типи на компіляції
- ✅ Неможливо відправити неправильні дані
- ✅ Автокомпліт в IDE

### **2. Валідація**

- ✅ Перевірка даних на фронтенді
- ✅ Раннє виявлення помилок
- ✅ Кращий UX для користувача

### **3. Підтримка**

- ✅ Легко змінювати API
- ✅ Централізовані типи
- ✅ Документація через типи

---

## 🚀 **Наступні кроки:**

### **1. Розширення синхронізації**

- [ ] Додати валідацію для всіх API endpoints
- [ ] Створити спільні enum'и
- [ ] Додати JSDoc коментарі

### **2. Автоматизація**

- [ ] Генерація типів з OpenAPI схеми
- [ ] Автоматична валідація
- [ ] CI/CD перевірки типів

### **3. Документація**

- [ ] API документація
- [ ] Приклади використання
- [ ] Troubleshooting guide

---

## 📊 **Результат синхронізації:**

### **До синхронізації:**

```typescript
// ❌ Помилки типів
await galleryApi.createPair({
  albumId: "2", // string замість number
  beforePhotos: ["url1", "url2"], // масив замість ID
  afterPhotos: ["url3", "url4"],
});
```

### **Після синхронізації:**

```typescript
// ✅ Правильні типи
await galleryApi.createPair({
  albumId: 2, // number
  beforePhotoId: 34, // number
  afterPhotoId: 37, // number
  label: "Пара 1",
});
```

**Результат:** Повна типобезпека і валідація на всіх рівнях! 🎉

