const axios = require("axios");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api/v1";

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log("Використання: node create-admin.js <email> <password>");
    console.log("Приклад: node create-admin.js admin@example.com password123");
    process.exit(1);
  }

  try {
    console.log("Створення адміністратора...");

    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      password,
      name: "Admin",
    });

    console.log("✅ Адміністратор успішно створено!");
    console.log(`📧 Email: ${email}`);
    console.log("🔑 Тепер можете увійти в систему через /login");
  } catch (error) {
    if (error.response) {
      console.error(
        "❌ Помилка:",
        error.response.data.message || "Невідома помилка"
      );
    } else {
      console.error("❌ Помилка з'єднання з сервером");
    }
    process.exit(1);
  }
}

createAdmin();
