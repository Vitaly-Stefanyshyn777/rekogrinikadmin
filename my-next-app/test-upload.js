const fs = require("fs");
const FormData = require("form-data");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Конфігурація
const API_BASE = "http://localhost:3002/api/v1";
const FRONTEND_BASE = "http://localhost:3001/api/v1";

// Функція для завантаження фото
async function uploadPhoto(filePath, title, description, useFrontend = false) {
  const baseUrl = useFrontend ? FRONTEND_BASE : API_BASE;

  try {
    console.log(`🔄 Завантаження фото: ${title} - ${description}`);
    console.log(`📁 Файл: ${filePath}`);
    console.log(`🌐 URL: ${baseUrl}/upload/photo`);

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("albumId", "2"); // ID альбому "До/Після"
    form.append("title", title);
    form.append("description", description);

    const response = await fetch(`${baseUrl}/upload/photo`, {
      method: "POST",
      body: form,
      headers: {
        ...form.getHeaders(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Успішно завантажено: ${result.url}`);
    return result;
  } catch (error) {
    console.error(`❌ Помилка завантаження ${title}:`, error.message);
    throw error;
  }
}

// Функція для тестування завантаження всіх фото
async function testUploadAll() {
  console.log("🚀 Початок тестування завантаження 6 фото...\n");

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

    console.log('📸 Завантаження 3 фото "До"...');
    const beforePhotos = [];
    for (let i = 0; i < beforeFiles.length; i++) {
      const photo = await uploadPhoto(
        beforeFiles[i],
        "До",
        `Фото до - ${i + 1}`,
        true // Використовуємо фронтенд проксі
      );
      beforePhotos.push(photo);
    }

    console.log('\n📸 Завантаження 3 фото "Після"...');
    const afterPhotos = [];
    for (let i = 0; i < afterFiles.length; i++) {
      const photo = await uploadPhoto(
        afterFiles[i],
        "Після",
        `Фото після - ${i + 1}`,
        true // Використовуємо фронтенд проксі
      );
      afterPhotos.push(photo);
    }

    console.log("\n🎉 Всі 6 фото успішно завантажено!");
    console.log("\n📊 Результати:");
    console.log('Фото "До":');
    beforePhotos.forEach((photo, i) => {
      console.log(`  ${i + 1}. ${photo.url}`);
    });
    console.log('\nФото "Після":');
    afterPhotos.forEach((photo, i) => {
      console.log(`  ${i + 1}. ${photo.url}`);
    });

    // Тут можна додати логіку створення пар
    console.log(
      "\n💡 Наступний крок: Створення пар з цих фото через адмін панель"
    );
  } catch (error) {
    console.error("\n❌ Помилка тестування:", error.message);
    process.exit(1);
  }
}

// Функція для тестування одного фото
async function testSingleUpload() {
  console.log("🧪 Тестування завантаження одного фото...\n");

  try {
    const photo = await uploadPhoto(
      "before1.png",
      "Тест",
      "Тестове фото",
      true // Використовуємо фронтенд проксі
    );

    console.log("✅ Тест пройшов успішно!");
    console.log(`📸 URL: ${photo.url}`);
  } catch (error) {
    console.error("❌ Тест не пройшов:", error.message);
  }
}

// Головна функція
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--single")) {
    await testSingleUpload();
  } else {
    await testUploadAll();
  }
}

// Запуск
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadPhoto, testUploadAll, testSingleUpload };
