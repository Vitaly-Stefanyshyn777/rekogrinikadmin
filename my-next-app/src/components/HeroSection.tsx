"use client";

import React, { useState, useEffect } from "react";
import { publicApi, HeroBlock } from "@/lib/api";

export const HeroSection: React.FC = () => {
  const [hero, setHero] = useState<HeroBlock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHero();
  }, []);

  const loadHero = async () => {
    try {
      const response = await publicApi.getHero();
      setHero(response.data);
    } catch (error) {
      console.error("Помилка завантаження Hero блоку:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">
          RekoGrinik – Rekonstrukce bytů a domů v Praze
        </h1>
        <p className="text-lg opacity-90">
          Kompletní rekonstrukce na klíč, pevné rozpočty a termíny
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {hero.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-lg"
          style={{ backgroundImage: `url(${hero.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
        </div>
      )}
      <div
        className={`relative p-8 rounded-lg ${
          hero.backgroundImage
            ? "text-white"
            : "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        }`}
      >
        <h1 className="text-3xl font-bold mb-4">{hero.title}</h1>
        <p className="text-lg opacity-90">{hero.subtitle}</p>
      </div>
    </div>
  );
};
