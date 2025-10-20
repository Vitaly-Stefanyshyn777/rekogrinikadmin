import { redirect } from "next/navigation";

export default function Home() {
  // Перенаправляємо на сторінку логіну
  redirect("/login");
}
