#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

// Отримуємо порт з аргументів командного рядка
const port = process.argv[2] || "3000";

console.log(`🚀 Запуск адмін панелі на порту ${port}...`);
console.log(`📋 Адмін панель буде доступна на: http://localhost:${port}`);
console.log(`🔧 Для зупинки натисніть Ctrl+C`);

// Запускаємо Next.js сервер
const child = spawn("pnpm", ["dev", "--port", port], {
  stdio: "inherit",
  shell: true,
  cwd: __dirname,
});

// Обробка сигналів для коректного завершення
process.on("SIGINT", () => {
  console.log("\n🛑 Зупинка сервера...");
  child.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Зупинка сервера...");
  child.kill("SIGTERM");
  process.exit(0);
});

child.on("error", (error) => {
  console.error("❌ Помилка запуску сервера:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  if (code !== 0) {
    console.error(`❌ Сервер завершився з кодом ${code}`);
    process.exit(code);
  }
});

