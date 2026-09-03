"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: number;
  email: string;
  name?: string;
}

interface ApiToken {
  jti: string;
  label?: string;
  createdAt: string;
  expiresAt?: string;
  revoked: boolean;
  token?: string;
}

export default function TokensAdminPage() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [label, setLabel] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | undefined>(3600);

  useEffect(() => {
    if (!isLoading && user) fetchUsers();
  }, [isLoading, user]);

  async function fetchUsers() {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data: User[] = await res.json();
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchTokensFor(userId: number) {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/v1/tokens/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load tokens");
      const data: ApiToken[] = await res.json();
      setTokens(data || []);
    } catch (e) {
      console.error(e);
      setTokens([]);
    }
  }

  async function createToken() {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/v1/tokens/user/${selectedUser}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label, expiresIn }),
      });
      if (!res.ok) throw new Error("Failed to create token");
      const data: ApiToken = await res.json();
      alert(
        "Token created. Copy it now (it's shown once).\n\n" +
          (data.token || ""),
      );
      await fetchTokensFor(selectedUser);
    } catch (e) {
      console.error(e);
      alert("Помилка створення токена");
    }
  }

  async function revoke(jti: string) {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/v1/tokens/${jti}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to revoke");
      await fetchTokensFor(selectedUser!);
    } catch (e) {
      console.error(e);
      alert("Помилка відкликання токена");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Управління токенами користувачів</h1>

      <div className="mb-4">
        <label className="block mb-1">Користувач</label>
        <select
          value={selectedUser ?? ""}
          onChange={(e) => {
            const v = Number(e.target.value);
            setSelectedUser(isNaN(v) ? null : v);
            if (!isNaN(v)) fetchTokensFor(v);
          }}
        >
          <option value="">-- Виберіть користувача --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.email}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Мітка (label)</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>

      <div className="mb-4">
        <label className="block mb-1">
          Термін дії (секунд, порожньо = без терміну)
        </label>
        <input
          type="number"
          value={expiresIn ?? ""}
          onChange={(e) =>
            setExpiresIn(e.target.value ? Number(e.target.value) : undefined)
          }
        />
      </div>

      <div className="mb-6">
        <button onClick={createToken} className="btn-primary">
          Створити токен
        </button>
      </div>

      <div>
        <h2 className="text-xl mb-2">Токени</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th>jti</th>
              <th>label</th>
              <th>createdAt</th>
              <th>expiresAt</th>
              <th>revoked</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.jti}>
                <td>{t.jti}</td>
                <td>{t.label}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td>
                  {t.expiresAt ? new Date(t.expiresAt).toLocaleString() : "—"}
                </td>
                <td>{t.revoked ? "так" : "ні"}</td>
                <td>
                  {!t.revoked && (
                    <button onClick={() => revoke(t.jti)}>Відкликати</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
