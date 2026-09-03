// Центральне місце для перемикання базового домену бекенду
// Локальна розробка:
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";

// Прод (закоментовано):
// export const BACKEND_URL =
//   "https://rekogrinikfrontbeck-production-a699.up.railway.app";
