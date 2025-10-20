const fs = require("fs");
const FormData = require("form-data");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Конфігурація
const API_BASE = "http://localhost:3002/api/v1";
const FRONTEND_BASE = "http://localhost:3001/api/v1";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInBhc3N3b3JkIjpudWxsLCJpYXQiOjE3NjA3Njg4MDUsImV4cCI6MTc2MDg1NTIwNX0.ABFmSyJUSClxbmfgKKUT0RDm4WHPwx9OkKnNxca9HnE";

// Функція для завантаження фото
async function uploadPhoto(filePath, title, description) {
  try {
    console.log(`🔄 Завантаження фото: ${title} - ${description}`);
    console.log(`📁 Файл: ${filePath}`);

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("albumId", "2");
    form.append("title", title);
    form.append("description", description);

    const response = await fetch(`${API_BASE}/upload/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Успішно завантажено: ID ${result.id}`);
    return result;
  } catch (error) {
    console.error(`❌ Помилка завантаження ${title}:`, error.message);
    throw error;
  }
}

// Функція для створення пари
async function createPair(albumId, beforePhotoId, afterPhotoId, label) {
  try {
    console.log(`🔄 Створення пари: ${beforePhotoId} → ${afterPhotoId}`);

    const response = await fetch(`${API_BASE}/gallery/pairs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        albumId: parseInt(albumId),
        beforePhotoId: parseInt(beforePhotoId),
        afterPhotoId: parseInt(afterPhotoId),
        label: label,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Пару створено: ID ${result.id}`);
    return result;
  } catch (error) {
    console.error(`❌ Помилка створення пари:`, error.message);
    throw error;
  }
}

// Функція для тестування створення пар з 6 фото
async function testPairCreation() {
  console.log("🚀 Тестування створення пар з 6 фото...\n");

  const beforeFiles = ["before1.png", "before2.png", "before3.png"];
  const afterFiles = ["after1.png", "after2.png", "after3.png"];

  try {
    // Перевіряємо наявність файлів
    const allFiles = [...beforeFiles, ...afterFiles];
    for (const file of allFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Файл ${file} не знайдено`);
      }
    }

    console.log("📸 Завантаження 3 фото 'До'...");
    const beforePhotos = [];
    for (let i = 0; i < beforeFiles.length; i++) {
      const photo = await uploadPhoto(
        beforeFiles[i],
        "До",
        `Фото до - ${i + 1}`
      );
      beforePhotos.push(photo);
    }

    console.log("\n📸 Завантаження 3 фото 'Після'...");
    const afterPhotos = [];
    for (let i = 0; i < afterFiles.length; i++) {
      const photo = await uploadPhoto(
        afterFiles[i],
        "Після",
        `Фото після - ${i + 1}`
      );
      afterPhotos.push(photo);
    }

    console.log("\n👥 Створення 3 пар...");
    const pairs = [];
    for (let i = 0; i < 3; i++) {
      const pair = await createPair(
        2, // albumId
        beforePhotos[i].id,
        afterPhotos[i].id,
        `Тестова пара ${i + 1}`
      );
      pairs.push(pair);
    }

    console.log("\n🎉 Всі 6 фото завантажено і 3 пари створено!");
    console.log("\n📊 Результати:");
    console.log("Фото 'До':");
    beforePhotos.forEach((photo, i) => {
      console.log(`  ${i + 1}. ID: ${photo.id}, URL: ${photo.url}`);
    });
    console.log("\nФото 'Після':");
    afterPhotos.forEach((photo, i) => {
      console.log(`  ${i + 1}. ID: ${photo.id}, URL: ${photo.url}`);
    });
    console.log("\nПари:");
    pairs.forEach((pair, i) => {
      console.log(
        `  ${i + 1}. ID: ${pair.id}, Пара: ${pair.beforePhotoId} → ${
          pair.afterPhotoId
        }`
      );
    });
  } catch (error) {
    console.error("\n❌ Помилка тестування:", error.message);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  testPairCreation().catch(console.error);
}

module.exports = { uploadPhoto, createPair, testPairCreation };

