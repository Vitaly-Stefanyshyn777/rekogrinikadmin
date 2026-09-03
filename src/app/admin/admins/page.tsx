"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface AdminUser {
  id: number;
  name?: string;
  email: string;
  role?: string;
  avatarUrl?: string;
}

export default function AdminsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const api = (path: string) => `${API_BASE}${path}`;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && localStorage.getItem("isSuper") !== "1") {
      router.replace("/admin");
    }
  }, [user, isLoading, router]);

  const fetchAdmins = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      const res = await fetch(api("/api/v1/users"), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      const list = (data || []).filter(
        (u: AdminUser) => String(u.role).toUpperCase() === "ADMIN",
      );
      setAdmins(list);
    } catch (e) {
      console.error(e);
      setAdmins([]);
    }
  };

  const isSuper = () => {
    if (!user) return false;
    const u = user;
    const envAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com";
    return (
      u.email === envAdmin || u.id === "1" || u.email === "admin@example.com"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(api("/api/v1/users/user"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          name,
          email,
          password,
          role: "ADMIN",
          avatarUrl,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        // include server response in error when possible
        throw new Error(txt && txt.length < 2000 ? txt : "Error creating user");
      }

      alert("Користувача створено");
      setName("");
      setEmail("");
      setPassword("");
      setAvatarUrl("");
      setShowForm(false);
      await fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Помилка: " + (err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (id: number) => {
    if (!confirm("Ви впевнені, що хочете видалити цього адміністратора?"))
      return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(api(`/api/v1/users/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchAdmins();
    } catch (e) {
      console.error(e);
      alert("Помилка видалення");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-6">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-4 shadow-md sm:p-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
          Адміністратори
        </h1>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white shadow hover:from-blue-700 hover:to-indigo-700 sm:w-auto sm:px-5"
          >
            Додати адміністратора
          </button>
          <button
            onClick={() => {
              setShowList((v) => !v);
              if (!showList) fetchAdmins();
            }}
            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-800 sm:w-auto"
          >
            {showList ? "Приховати список" : "Показати адміністраторів"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 w-full max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ім&apos;я
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Avatar URL (optional)
              </label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
              {avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt="avatar preview"
                  width={80}
                  height={80}
                  className="mt-2 h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white shadow hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
              >
                {loading ? "Створюється..." : "Створити адміністратора"}
              </button>
            </div>
          </form>
        )}

        {showList && (
          <div>
            <h2 className="text-xl mb-4 text-gray-800">
              Список адміністраторів
            </h2>
            <div className="space-y-3">
              {admins.length === 0 && (
                <div className="text-sm text-gray-600">
                  Адміністраторів не знайдено.
                </div>
              )}
              {admins.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 rounded-md border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="min-w-0">
                      {a.avatarUrl ? (
                        <Image
                          src={a.avatarUrl}
                          alt="Аватар"
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {(a.name || a.email || "A").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {a.name || a.email}
                      </div>
                      <div className="break-all text-sm text-gray-500">{a.email}</div>
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    {isSuper() && (
                      <button
                        onClick={() => deleteAdmin(a.id)}
                        className="w-full rounded-md bg-red-600 px-3 py-2 text-sm text-white sm:w-auto"
                      >
                        Видалити
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
