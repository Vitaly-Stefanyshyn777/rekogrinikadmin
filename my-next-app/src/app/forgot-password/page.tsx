"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";
import { ArrowLeft, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Введіть email");
      return;
    }

    try {
      setLoading(true);
      await authApi.requestPasswordReset(email);
      setSent(true);
      toast.success("Інструкції надіслано на ваш email");
    } catch (error: any) {
      const message = error.response?.data?.message || "Помилка відправки";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Перевірте email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ми надіслали інструкції для скидання паролю на {email}
            </p>
          </div>

          <div className="mt-6">
            <Button onClick={() => router.push("/login")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Повернутися до входу
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Скидання паролю
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введіть ваш email для отримання інструкцій
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Надіслати інструкції
          </Button>

          <div className="text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Повернутися до входу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

